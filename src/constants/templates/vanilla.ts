export default `
<style>

</style>

<script>
    //@PCT=URL;
    
    window.persDOM_INJECT_SCRIPTChangesApplied = false;

    function persDOM_INJECT_SCRIPTChangesToApply() {
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