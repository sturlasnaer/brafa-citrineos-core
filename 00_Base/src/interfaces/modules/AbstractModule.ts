/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright (c) 2023 S44, LLC
 */

import 'reflect-metadata';
import { ILogObj, Logger } from "tslog";
import { AS_HANDLER_METADATA, IHandlerDefinition, IModule } from ".";
import { OcppRequest, OcppResponse } from "../..";
import { SystemConfig } from "../../config/types";
import { CallAction } from "../../ocpp/rpc/message";
import { RequestBuilder } from "../../util/request";
import { CacheNamespace, ICache } from "../cache/cache";
import { ClientConnection } from "../centralsystem";
import { EventGroup, HandlerProperties, IMessage, IMessageConfirmation, IMessageHandler, IMessageSender, MessageOrigin, MessageState } from "../messages";

export abstract class AbstractModule implements IModule {

    protected _config: SystemConfig;
    protected readonly _cache: ICache;
    protected readonly _handler: IMessageHandler;
    protected readonly _sender: IMessageSender;
    protected readonly _eventGroup: EventGroup;
    protected readonly _logger: Logger<ILogObj>;

    constructor(config: SystemConfig, cache: ICache, handler: IMessageHandler, sender: IMessageSender, eventGroup: EventGroup, logger?: Logger<ILogObj>) {
        this._config = config;
        this._handler = handler;
        this._sender = sender;
        this._eventGroup = eventGroup;
        this._cache = cache;

        this._logger = this._initLogger(logger);

        // Set module for proper message flow.
        this.handler.module = this;
    }

    /**
     * Getters & Setters
     */

    get sender(): IMessageSender {
        return this._sender;
    }

    get handler(): IMessageHandler {
        return this._handler;
    }

    /**
     * Sets the system configuration for the module.
     *
     * @param {SystemConfig} config - The new configuration to set.
     */
    set config(config: SystemConfig) {
        this._config = config;
        // Update all necessary settings for hot reload
        this._logger.info(`Updating system configuration for ${this._eventGroup} module...`);
        this._logger.settings.minLevel = this._config.server.logLevel;
    }

    get config(): SystemConfig {
        return this._config;
    }

    /**
     * Methods
     */

    /**
       * Initializes the handler for handling requests and responses.
       *
       * @param {CallAction[]} requests - The array of call actions for requests.
       * @param {CallAction[]} responses - The array of call actions for responses.
       * @return {Promise<boolean>} Returns a promise that resolves to a boolean indicating if the initialization was successful.
       */
    protected async _initHandler(requests: CallAction[], responses: CallAction[]): Promise<boolean> {

        let success = await this._handler.subscribe(this._eventGroup.toString() + "_requests", requests, {
            state: MessageState.Request.toString()
        });

        success = success && await this._handler.subscribe(this._eventGroup.toString() + "_responses", responses, {
            state: MessageState.Response.toString()
        });

        return success;
    }

    /**
     * Initializes the logger for the class.
     *
     * @return {Logger<ILogObj>} The initialized logger.
     */
    protected _initLogger(baseLogger?: Logger<ILogObj>): Logger<ILogObj> {
        return baseLogger ? baseLogger.getSubLogger({ name: this.constructor.name }) : new Logger<ILogObj>({
            name: this.constructor.name,
            minLevel: this._config.server.logLevel,
            hideLogPositionForProduction: this._config.env === "production"
        });
    }

    /**
     * Interface methods.
     */

    /**
     * Unimplemented method to handle incoming {@link IMessage}. 
     * 
     * **Note**: This method is **programmatically** overridden by the {@link ModuleHandlers} annotation.
     * 
     * @param message The {@link IMessage} to handle. Can contain either a {@link OcppRequest} or a {@link OcppResponse} as payload.
     * @param props The {@link HandlerProperties} for this {@link IMessage} containing implementation specific metadata. Metadata is not used in the base implementation.
     */

    /**
     * Handles a message with an OcppRequest or OcppResponse payload.
     *
     * @param {IMessage<OcppRequest | OcppResponse>} message - The message to handle.
     * @param {HandlerProperties} props - Optional properties for the handler.
     * @return {void} This function does not return anything.
     */
    handle(message: IMessage<OcppRequest | OcppResponse>, props?: HandlerProperties): void {
        const handlerDefinition = (Reflect.getMetadata(AS_HANDLER_METADATA, this.constructor) as Array<IHandlerDefinition>).filter((h) => h.action === message.action).pop();
        if (handlerDefinition) {
            handlerDefinition.method.call(this, message, props);
            // this.constructor.prototype[handlerDefinition.methodName].call(this, message, props);
        } else {
            this._logger.error("Failed handling message. No handler found for action: ", message.action);
        }
    }

    /**
     * Calls shutdown on the handler and sender.
     * 
     * Note: To be overwritten by subclass if other logic is necessary.
     *
     */
    shutdown(): void {
        this._handler.shutdown();
        this._sender.shutdown();
    }

    /**
     * Default implementation
     */

    /**
     * Sends a call with the specified identifier, tenantId, action, payload, and origin.
     *
     * @param {string} identifier - The identifier of the call.
     * @param {string} tenantId - The tenant ID.
     * @param {CallAction} action - The action to be performed.
     * @param {OcppRequest} payload - The payload of the call.
     * @param {MessageOrigin} [origin] - The origin of the call.
     * @return {Promise<IMessageConfirmation>} A promise that resolves to the message confirmation.
     */
    public sendCall(identifier: string, tenantId: string, action: CallAction, payload: OcppRequest, origin?: MessageOrigin): Promise<IMessageConfirmation> {
        // TODO: Future - Compound key with tenantId
        return this._cache.get<ClientConnection>(identifier, CacheNamespace.Connections, () => ClientConnection).then((connection) => {
            if (connection && connection.isAlive) {
                return this._sender.sendRequest(
                    RequestBuilder.buildCall(
                        identifier,
                        tenantId,
                        action,
                        payload,
                        this._eventGroup,
                        origin
                    )
                );
            } else {
                this._logger.error("Failed sending call. No connection found for identifier: ", identifier);
                return Promise.resolve({ success: false, payload: "No connection found for identifier: " + identifier });
            }
        });

    }

    /**
     * Sends the call result message and returns a Promise that resolves with the confirmation message.
     *
     * @param {string} correlationId - The correlation ID of the message.
     * @param {string} identifier - The identifier of the message.
     * @param {string} tenantId - The ID of the tenant.
     * @param {CallAction} action - The call action.
     * @param {OcppResponse} payload - The payload of the call result message.
     * @param {MessageOrigin} origin - (optional) The origin of the message.
     * @return {Promise<IMessageConfirmation>} A Promise that resolves with the confirmation message.
     */
    public sendCallResult(correlationId: string, identifier: string, tenantId: string, action: CallAction, payload: OcppResponse, origin?: MessageOrigin): Promise<IMessageConfirmation> {
        return this._sender.sendResponse(
            RequestBuilder.buildCallResult(
                correlationId,
                identifier,
                tenantId,
                action,
                payload,
                this._eventGroup,
                origin
            )
        );
    }

    /**
     * Sends the call result with a message.
     *
     * @param {IMessage<OcppResponse>} message - The message object.
     * @param {OcppResponse} payload - The payload to send.
     * @return {Promise<IMessageConfirmation>} A promise that resolves to the message confirmation.
     */
    public sendCallResultWithMessage(message: IMessage<OcppResponse>, payload: OcppResponse): Promise<IMessageConfirmation> {
        return this._sender.sendResponse(message, payload);
    }
}