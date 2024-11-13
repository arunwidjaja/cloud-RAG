import { clear_all_selections } from './file_handlers.js';
import { add_log } from './log_handlers.js';
import {
    start_summarization,
    start_theme_analysis,
} from '../api/api.js'

export const preset_summarize_selection = async (selected_files) => {
    if (selected_files.length === 0) {
        add_log("Please select files to summarize first.")
    } else {
        add_log("Summarizing files...")
        const summary = await start_summarization(selected_files);

        //add_bubble(summary, "OUTPUT")
        add_log(summary)

        add_log("Files summarized: ")
        selected_files.forEach(file => {
            add_log(file.name)
        });
        clear_all_selections();
    }
};
export const preset_analyze_themes = async (selected_files) => {
    if (selected_files.length === 0) {
        add_log("Please select files to analyze first.")
    } else {
        add_log("Analyzing themes...")
        const theme_analysis = await start_theme_analysis(selected_files);
        // const theme_analysis_text = theme_analysis.message;
        // const theme_analysis_context = theme_analysis.contexts;
        // const theme_analysis_id = theme_analysis.id;

        // add_bubble(theme_analysis, 'OUTPUT');
        // for (let i = 0; i < theme_analysis_context.length; i++) {
        //   const context = theme_analysis_context[i];
        //   add_bubble(context, 'CONTEXT');
        // }

        add_log(theme_analysis)

        add_log("Files analyzed: ")
        selected_files.forEach(file => {
            add_log(file.name)
        });
        clear_all_selections();
    }
};
export const preset_analyze_sentiment = async (selected_files) => {
    add_log("Sentiment Analysis is not available yet")
};