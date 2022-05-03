import { readFile } from "../utils";
import * as path from "path";

export default {
    es6TemplateGen: async (persNum: string) => {
        // const es6Template: any = await readFile(path.join(__dirname, "..\\src\\constants\\templates\\es6.html"));
        // let file = es6Template.replace(/DOM_INJECT_SCRIPT/g, persNum);
        return `
<style>
    #main {
        opacity: 0;
    }
</style>

<script>
    window.pers${persNum}ChangesApplied = false;

    const PERS_STORY = "pers-${persNum}";

    const pers${persNum}ChangesToApply = async () => {
        
        const tryCatch = (fun, block) => {
            try {fun();} catch (err) {console.error(PERS_STORY + ' error in ' + block + ': ' + err);}
        }

        const siteDefaults = new Promise ((res) => {
            tryCatch(() => {
                $("#main").css("opacity", "1");
            }, "siteDefaults")
            res();
        });

        await siteDefaults;
    }

    window.addEventListener("load", function () {
        if (!window.pers${persNum}ChangesApplied) {
            window.pers${persNum}ChangesApplied = true;
            pers${persNum}ChangesToApply();
        }
    });

    if (!window.pers${persNum}ChangesApplied && document.readyState === "complete") {
        window.pers${persNum}ChangesApplied = true;
        pers${persNum}ChangesToApply();
    }
</script>
        `;
    },
    vanillaTemplateGen: async (persNum: string) => {
        // const vanillaTemplate: any = await readFile(path.join(__dirname, "..\\src\\constants\\templates\\vanilla.html"));
        // let file = vanillaTemplate.replace(/DOM_INJECT_SCRIPT/g, persNum);
        return `
<style>

</style>

<script>
    window.persDOM_INJECT_SCRIPTChangesApplied = false;

    function persDOM_INJECT_SCRIPTChangesToApply() {
        
    }

    window.addEventListener("load", function () {
        if (!window.persDOM_INJECT_SCRIPTChangesApplied) {
            window.persDOM_INJECT_SCRIPTChangesApplied = true;
            persDOM_INJECT_SCRIPTChangesToApply();
        }
    });
    // In case the window is already loaded, apply the changes here

    if (!window.persDOM_INJECT_SCRIPTChangesApplied && document.readyState === "complete") {
        window.persDOM_INJECT_SCRIPTChangesApplied = true;
        persDOM_INJECT_SCRIPTChangesToApply();
    }
</script>
        `;
    },
};