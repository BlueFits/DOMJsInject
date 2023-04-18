export default `
<style>

</style>

<script>
    window.persDOM_INJECT_SCRIPTChangesApplied = false;

    function persDOM_INJECT_SCRIPTChangesToApply() {
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
        // Insert code here 
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