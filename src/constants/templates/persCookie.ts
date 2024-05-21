export default `
<style>

  #main {

    opacity: 0;

  }

</style>

 

<script>
  //@PCT=URL;


  window.persDOM_INJECT_SCRIPTChangesApplied = false;

 

  function persDOM_INJECT_SCRIPTChangesToApply() {

    // Linking CSS file located in WEM link

    $("head").prepend(

      '<link rel="stylesheet" type="text/css" href="https://www.bmo.com//Personalization/files/persDOM_INJECT_SCRIPT_styles.css">'

    );

 

    // Add the code changes here

 

    $("#main").css("opacity", 1);

  }

 

  function getPersCookie(cname) {

    // Get name followed by anything except a semicolon

    var name = cname + "=";

    var decodedCookie = decodeURIComponent(document.cookie);

    var ca = decodedCookie.split(";");

    for (var i = 0; i < ca.length; i++) {

      var c = ca[i];

      while (c.charAt(0) == " ") {

        c = c.substring(1);

      }

      if (c.indexOf(name) == 0) {

        return c.substring(name.length, c.length);

      }

    }

    return "";

  }

 

  function persCookieAutheticated() {

    const MCBRIDGE = getPersCookie("MCBRIDGE");

    const MCCHANNEL = getPersCookie("MCCHANNEL");

 

    /**

     * If both the MCBRIDGE AND MCHANNEL cookies are set

     * User is authenticated (logged in).

     */

    if (MCBRIDGE && MCCHANNEL) return true;

 

    /**

     * If the bmoccruid is set to anything and the bmochannel is 'MBA'.

     * user is authenticated

     */

    const bmoccruid = getPersCookie("bmoccruid");

    const bmochannel = getPersCookie("bmochannel");

    if (bmoccruid && bmochannel === "MBA") return true;

 

    /**

     * If MCFROMBANK is set to anything user is authenticated.

     */

    const MCFROMBANK = getPersCookie("MCFROMBANK");

    if (MCFROMBANK) return true;

 

    /* Under all other circumstances user is unauthenticated */

    return false;

  }

 

  if (!persCookieAutheticated()) {

    // Add your code here to exclude branch flow

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

  } else {

    $("#main").css("opacity", 1);

  }

</script>
`;