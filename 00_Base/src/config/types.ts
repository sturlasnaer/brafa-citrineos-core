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

import { z } from "zod";
import { RegistrationStatusEnumType } from "../ocpp/model/enums";

export const systemConfigInputSchema = z.object({
    env: z.enum(["development", "production"]),
    modules: z.object({
        certificates: z.object({
            endpointPrefix: z.string().default("certificates").optional(),
            port: z.number().int().positive().default(8081).optional(),
        }).optional(),
        evdriver: z.object({
            endpointPrefix: z.string().default("commands").optional(),
            port: z.number().int().positive().default(8081).optional(),
        }),
        configuration: z.object({
            heartbeatInterval: z.number().int().positive().default(60).optional(),
            bootRetryInterval: z.number().int().positive().default(10).optional(),
            unknownChargerStatus: z.enum([RegistrationStatusEnumType.Accepted, RegistrationStatusEnumType.Pending, RegistrationStatusEnumType.Rejected]).default(RegistrationStatusEnumType.Accepted).optional(), // Unknown chargers have no entry in BootConfig table
            getBaseReportOnPending: z.boolean().default(true).optional(),
            bootWithRejectedVariables: z.boolean().default(true).optional(),
            autoAccept: z.boolean().default(true).optional(), // If false, only data endpoint can update boot status to accepted
            endpointPrefix: z.string().default("configuration").optional(),
            port: z.number().int().positive().default(8081).optional(),
        }), // Configuration module is required
        monitoring: z.object({
            endpointPrefix: z.string().default("monitoring").optional(),
            port: z.number().int().positive().default(8081).optional(),
        }),
        reporting: z.object({
            endpointPrefix: z.string().default("reporting").optional(),
            port: z.number().int().positive().default(8081).optional(),
        }).optional(),
        smartcharging: z.object({
            endpointPrefix: z.string().default("smartcharging").optional(),
            port: z.number().int().positive().default(8081).optional(),
        }).optional(),
        transactions: z.object({
            endpointPrefix: z.string().default("transactions").optional(),
            port: z.number().int().positive().default(8081).optional(),
        }), // Transactions module is required
    }),
    data: z.object({
        sequelize: z.object({
            host: z.string().default('localhost').optional(),
            port: z.number().int().positive().default(5432).optional(),
            database: z.string().default('csms').optional(),
            dialect: z.any().default('sqlite').optional(),
            username: z.string().optional(), 
            password: z.string().optional(), 
            storage: z.string().default('csms.sqlite').optional(),
            sync: z.boolean().default(false).optional(),
        }),
    }),
    util: z.object({
        cache: z.object({
            memory: z.boolean().optional(),
            redis: z.object({
                host: z.string().default('localhost').optional(),
                port: z.number().int().positive().default(6379).optional(),
            }).optional(),
        }).refine(obj => obj.memory || obj.redis, {
            message: 'A cache implementation must be set'
        }),
        messageBroker: z.object({
            pubsub: z.object({
                topicPrefix: z.string().default('ocpp').optional(),
                topicName: z.string().optional(),
                servicePath: z.string().optional(),
            }).optional(),
            kafka: z.object({
                topicPrefix: z.string().optional(),
                topicName: z.string().optional(),
                brokers: z.array(z.string()),
                sasl: z.object({
                    mechanism: z.string(),
                    username: z.string(),
                    password: z.string()
                })
            }).optional(),
            amqp: z.object({
                url: z.string(),
                exchange: z.string(),
            }).optional(),
        }).refine(obj => obj.pubsub || obj.kafka || obj.amqp, {
            message: 'A message broker implementation must be set'
        })
    }),
    server: z.object({
        logLevel: z.number().min(0).max(6).default(0).optional(),
        host: z.string().default("localhost").optional(),
        port: z.number().int().positive().default(8081).optional(),
        swagger: z.object({
            path: z.string().default('/docs').optional(),
            exposeData: z.boolean().default(true).optional(),
            exposeMessage: z.boolean().default(true).optional(),
        }).optional(),
    }),
    websocketServer: z.object({
        tlsFlag: z.boolean().default(false).optional(),
        tlsKeysFilepath: z.string().optional(),
        tlsCertificateChainFilepath: z.string().optional(),
        port: z.number().int().positive().default(8080).optional(),
        host: z.string().default('localhost').optional(),
        protocol: z.string().default('ocpp2.0.1').optional(),
        pingInterval: z.number().int().positive().default(60).optional(),
        maxCallLengthSeconds: z.number().int().positive().default(5).optional(),
        maxCachingSeconds: z.number().int().positive().default(10).optional()
    })
});

export type SystemConfigInput = z.infer<typeof systemConfigInputSchema>;

export const systemConfigSchema = z.object({
    env: z.enum(["development", "production"]),
    modules: z.object({
        certificates: z.object({
            endpointPrefix: z.string(),
            port: z.number().int().positive(),
        }).optional(),
        evdriver: z.object({
            endpointPrefix: z.string(),
            port: z.number().int().positive(),
        }),
        configuration: z.object({
            heartbeatInterval: z.number().int().positive(),
            bootRetryInterval: z.number().int().positive(),
            unknownChargerStatus: z.enum([RegistrationStatusEnumType.Accepted, RegistrationStatusEnumType.Pending, RegistrationStatusEnumType.Rejected]), // Unknown chargers have no entry in BootConfig table
            getBaseReportOnPending: z.boolean(),
            bootWithRejectedVariables: z.boolean(),
            /**
             * If false, only data endpoint can update boot status to accepted
             */
            autoAccept: z.boolean(), 
            endpointPrefix: z.string(),
            port: z.number().int().positive(),
        }), // Configuration module is required
        monitoring: z.object({
            endpointPrefix: z.string(),
            port: z.number().int().positive(),
        }),
        reporting: z.object({
            endpointPrefix: z.string(),
            port: z.number().int().positive(),
        }).optional(),
        smartcharging: z.object({
            endpointPrefix: z.string(),
            port: z.number().int().positive(),
        }).optional(),
        transactions: z.object({
            endpointPrefix: z.string(),
            port: z.number().int().positive(),
        }), // Transactions module is required
    }),
    data: z.object({
        sequelize: z.object({
            host: z.string(),
            port: z.number().int().positive(),
            database: z.string(),
            dialect: z.any(),
            username: z.string(),
            password: z.string(),
            storage: z.string(),
            sync: z.boolean(),
        }),
    }),
    util: z.object({
        cache: z.object({
            memory: z.boolean().optional(),
            redis: z.object({
                host: z.string(),
                port: z.number().int().positive(),
            }).optional(),
        }).refine(obj => obj.memory || obj.redis, {
            message: 'A cache implementation must be set'
        }),
        messageBroker: z.object({
            pubsub: z.object({
                topicPrefix: z.string(),
                topicName: z.string().optional(),
                servicePath: z.string().optional(),
            }).optional(),
            kafka: z.object({
                topicPrefix: z.string().optional(),
                topicName: z.string().optional(),
                brokers: z.array(z.string()),
                sasl: z.object({
                    mechanism: z.string(),
                    username: z.string(),
                    password: z.string()
                })
            }).optional(),
            amqp: z.object({
                url: z.string(),
                exchange: z.string(),
            }).optional(),
        }).refine(obj => obj.pubsub || obj.kafka || obj.amqp, {
            message: 'A message broker implementation must be set'
        })
    }),
    server: z.object({
        logLevel: z.number().min(0).max(6),
        host: z.string(),
        port: z.number().int().positive(),
        swagger: z.object({
            path: z.string(),
            exposeData: z.boolean(),
            exposeMessage: z.boolean(),
        }).optional(),
    }),
    websocketServer: z.object({
        tlsFlag: z.boolean(),
        tlsKeysFilepath: z.string().optional(),
        tlsCertificateChainFilepath: z.string().optional(),
        port: z.number().int().positive(),
        host: z.string(),
        protocol: z.string(),
        pingInterval: z.number().int().positive(),
        maxCallLengthSeconds: z.number().int().positive(),
        maxCachingSeconds: z.number().int().positive()
    }).refine(websocketServer => websocketServer.maxCachingSeconds >= websocketServer.maxCallLengthSeconds, {
        message: 'maxCachingSeconds cannot be less than maxCallLengthSeconds'
    })
});

export type SystemConfig = z.infer<typeof systemConfigSchema>;