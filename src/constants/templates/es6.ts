export default `
<style>
    #main {
        opacity: 0;
    }
</style>

<script>
    window.persDOM_INJECT_SCRIPTChangesApplied = false;

    const PERS_STORY = "pers-DOM_INJECT_SCRIPT";

    const persDOM_INJECT_SCRIPTChangesToApply = async () => {
        
        const tryCatch = (fun, block) => {
            try {fun();} catch (err) {console.trace('%c ' + PERS_STORY + ' error in ' + block + ': ' + err, 'background: #222; color: #AD7150');}
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
        if (!window.persDOM_INJECT_SCRIPTChangesApplied) {
            window.persDOM_INJECT_SCRIPTChangesApplied = true;
            persDOM_INJECT_SCRIPTChangesToApply();
        }
    });

    if (!window.persDOM_INJECT_SCRIPTChangesApplied && document.readyState === "complete") {
        window.persDOM_INJECT_SCRIPTChangesApplied = true;
        persDOM_INJECT_SCRIPTChangesToApply();
    }
</script>
`;