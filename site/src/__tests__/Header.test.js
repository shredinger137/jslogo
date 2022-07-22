describe("Header renders correctly", () => {
    it('should pass this fake test', function () {
        var string1 = "software testing help - a great resource for testers"

        // test for success match
        expect(string1).toMatch(/test/);

        // test for failure match
        expect(string1).not.toMatch(/abc/)
    })

});