import { add_message } from "./message_handlers";

export const add_bubble = (bubble_content, bubble_type) => {
    let message_type;
    switch (bubble_type.toUpperCase()) {
      case "INPUT":
        message_type = "conversation_input";
        add_message({ text: bubble_content, type: message_type });
        break;
      case "OUTPUT":
        message_type = "conversation_output";
        add_message({ text: bubble_content, type: message_type });
        break;
      case "CONTEXT":
        message_type = "conversation_context";
        const context_source = bubble_content.source;
        const context_text = bubble_content.context;
        const context_hash = bubble_content.hash;
        const context_full_text = "Source: " + context_source + "\n\n" + context_text;
        add_message({ text: context_full_text, hash: context_hash, type: message_type });
        break;
    }
  }