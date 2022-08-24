const template = (varArg:string, directArg:string) => `

<script>
    (() => {
        let file1 = {
            name: "",
            var: {
                ${varArg}
            },
            direct: {
                ${directArg}
            },
        };

        return [ file1 ];
    })();
</script>
`;

export default template;