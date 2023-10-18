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

import { GetBaseReportRequest, GetVariablesRequest, IMessageConfirmation, ResetRequest, SetNetworkProfileRequest, SetVariablesRequest } from "@citrineos/base";

/**
 * Interface for the provisioning module.
 */
export interface IProvisioningModuleApi {
    getBaseReport(identifier: string, partyId: string, request: GetBaseReportRequest): Promise<IMessageConfirmation>;
    setVariables(identifier: string, partyId: string, request: SetVariablesRequest): Promise<IMessageConfirmation>;
    getVariables(identifier: string, partyId: string, request: GetVariablesRequest): Promise<IMessageConfirmation>;
    setNetworkProfile(identifier: string, partyId: string, request: SetNetworkProfileRequest): Promise<IMessageConfirmation>;
    reset(identifier: string, partyId: string, request: ResetRequest): Promise<IMessageConfirmation>;
}