import { Module } from "@medusajs/framework/utils"
import WebhookLogModuleService from "./service"

export const WEBHOOK_LOG_MODULE = "webhookLogModuleService"

export default Module(WEBHOOK_LOG_MODULE, {
  service: WebhookLogModuleService,
})
