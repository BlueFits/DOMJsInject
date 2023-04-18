export default `
<style>
    #main {
        opacity: 0;
    }
</style>

<script>
    window.persDOM_INJECT_SCRIPTChangesApplied = false;

    const persDOM_INJECT_SCRIPTChangesToApply = async () => {
        /* Used for TAVC */
        const orig_$ = $;
        $ = (param, options = { isImportant: false }) => {
            $.selectors = $.important && $.important.length > 0 ? [...$.important] : [];
            $.important = $.important && $.important.length > 0 ? [...$.important] : [];
            $.selectors.push({
                selector: param,
                length: orig_$(param).length,
            });
            if (options.isImportant) {
                $.important.push({
                    selector: param,
                    length: orig_$(param).length,
                });
            }
            return orig_$(param);
        }
        
        const tryCatch = (fun, block) => {
            try {fun();} catch (err) {console.trace('%c ' + 'PERS-DOM_INJECT_SCRIPT' + ' error in ' + block + ': ' + err, 'background: #222; color: #AD7150');}
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
