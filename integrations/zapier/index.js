const authentication = require("./authentication");
const createCustomer = require("./creates/create_customer");
const triggerVoiceCall = require("./creates/trigger_voice_call");
const newAlert = require("./triggers/new_alert");
const conversationCompleted = require("./triggers/conversation_completed");

module.exports = {
  version: require("./package.json").version,
  platformVersion: require("zapier-platform-core").version,
  authentication,
  triggers: {
    [newAlert.key]: newAlert,
    [conversationCompleted.key]: conversationCompleted,
  },
  creates: {
    [createCustomer.key]: createCustomer,
    [triggerVoiceCall.key]: triggerVoiceCall,
  },
};
