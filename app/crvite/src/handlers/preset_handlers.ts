import { clear_all_selections } from './file_handlers';
import { add_log } from './log_handlers';
import usePresetsStore from '@/stores/presetsStore';
import {
    start_summarization,
    start_theme_analysis,
} from '../api/api'
import { createAnswerMessage } from '../stores/messageStore';
import { add_message } from './message_handlers';
import useFilesStore from '@/stores/filesStore';

export const use_presets = () => {
    const presets = usePresetsStore((state) => state.presets);
    return presets;
}

export const preset_summarize_selection = async (): Promise<void> => {
    const selected_files = useFilesStore.getState().selected_files;
    if (selected_files.length === 0) {
        add_log("Please select files to summarize first.")
    } else {
        add_log("Summarizing files...")
        const summary = await start_summarization(selected_files);
        const summary_msg = createAnswerMessage(summary)

        add_message(summary_msg)

        add_log("Files summarized: ")
        selected_files.forEach(file => {
            add_log(file.name)
        });
        clear_all_selections();
    }
};
export const preset_analyze_themes = async (): Promise<void> => {
    const selected_files = useFilesStore.getState().selected_files;
    if (selected_files.length === 0) {
        add_log("Please select files to analyze first.")
    } else {
        add_log("Analyzing themes...")
        const theme_analysis = await start_theme_analysis(selected_files);
        const theme_analysis_msg = createAnswerMessage(theme_analysis)
        // const theme_analysis_text = theme_analysis.message;
        // const theme_analysis_context = theme_analysis.contexts;
        // const theme_analysis_id = theme_analysis.id;

        add_message(theme_analysis_msg)
        // for (let i = 0; i < theme_analysis_context.length; i++) {
        //   const context = theme_analysis_context[i];
        //   add_bubble(context, 'CONTEXT');
        // }

        add_log("Files analyzed: ")
        selected_files.forEach(file => {
            add_log(file.name)
        });
        clear_all_selections();
    }
};
export const preset_analyze_sentiment = async (): Promise<void> => {
    const selected_files = useFilesStore.getState().selected_files;
    if (selected_files.length === 0) {
        add_log("Please select files to analyze first.")
    } else {
        add_log("Sentiment Analysis is not available yet")
    }
};