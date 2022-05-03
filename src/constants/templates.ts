import { readFile } from "../utils";
import * as path from "path";

export default {
    es6TemplateGen: async (persNum: string) => {
        const es6Template: any = await readFile(path.join(__dirname, "..\\src\\constants\\templates\\es6.html"));
        let file = es6Template.replace(/DOM_INJECT_SCRIPT/g, persNum);
        return file;
    },
    vanillaTemplateGen: async (persNum: string) => {
        const vanillaTemplate: any = await readFile(path.join(__dirname, "..\\src\\constants\\templates\\vanilla.html"));
        let file = vanillaTemplate.replace(/DOM_INJECT_SCRIPT/g, persNum);
        return file;
    },
};