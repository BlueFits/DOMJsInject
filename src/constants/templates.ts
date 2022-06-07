import es6Template from "./templates/es6";
import vanillaTemplate from "./templates/vanilla";
import persCookieTemplate from "./templates/persCookie";

export default {
    es6TemplateGen: async (persNum: string) => {
        let file = es6Template.replace(/DOM_INJECT_SCRIPT/g, persNum);
        return file;
    },
    vanillaTemplateGen: async (persNum: string) => {
        let file = vanillaTemplate.replace(/DOM_INJECT_SCRIPT/g, persNum);
        return file;
    },
    persCookieTemplateGen: async (persNum: string) => {
        let file = persCookieTemplate.replace(/DOM_INJECT_SCRIPT/g, persNum);
        return file;
    },
};