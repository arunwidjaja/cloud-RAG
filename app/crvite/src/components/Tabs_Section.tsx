import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import { Tab_1_Content } from './Tab_1_Content';
import { Tab_2_Content } from './Tab_2_Content';
import { Tab_3_Content } from './Tab_3_Content';


export function Tabs_Section() {
    return (
        <Tabs defaultValue="data" className="w-[450px] flex flex-col h-full pb-2">
            <TabsList className="grid grid-cols-3 ml-4 mr-4">
                <TabsTrigger
                    value="data"
                >Retrieval</TabsTrigger>
                <TabsTrigger
                    value="files"
                >Database</TabsTrigger>
                <TabsTrigger
                    value="uploads"
                >Uploads</TabsTrigger>
            </TabsList>

            <TabsContent id="retrieval_tab_content" value="data" className='flex-1 rounded-lg p-4 mt-2 min-h-0 overflow-hidden'>
                <Tab_1_Content></Tab_1_Content>
            </TabsContent>

            <TabsContent value="files" className='flex-1 rounded-lg p-4 mt-2 min-h-0 overflow-hidden'>
                <Tab_2_Content></Tab_2_Content>
            </TabsContent>

            <TabsContent value="uploads" className='flex-1 rounded-lg p-4 mt-2 min-h-0 overflow-hidden'>
                <Tab_3_Content></Tab_3_Content>
            </TabsContent>
        </Tabs>
    )
}
