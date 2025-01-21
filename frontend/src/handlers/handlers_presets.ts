import { add_log } from './handlers_logs';
import usePresetsStore from '@/stores/presetsStore';
import { start_summarization, start_theme_analysis } from '../api/api_llm_calls'
import { createAnswerMessage } from '../stores/messageStore';
import { add_message } from './handlers_messages';
import useFilesStore from '@/stores/filesStore';



export const handle_select_preset = (selected_preset: string): void => {
    select_preset(selected_preset);
    add_log("Selected preset: " + selected_preset);
};

export const handle_run_preset = (): void => {
    const selected_preset = usePresetsStore.getState().selected_preset;

    switch (selected_preset.toUpperCase()) {
        case 'SUMMARIZE DOCUMENTS':
            preset_summarize_selection();
            break;
        case 'ANALYZE SENTIMENT':
            preset_analyze_themes();
            break;
        case 'EXTRACT THEMES':
            preset_analyze_sentiment();
            break;
    }
}

export const select_preset = (selected_preset: string) => {
    const selectPreset = usePresetsStore.getState().setSelectedPreset;
    selectPreset(selected_preset)
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