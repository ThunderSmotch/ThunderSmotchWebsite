describe("Sitemap", () => {
    let Sitemap: typeof import("../src/Sitemap");

    beforeEach(() => {
        return import('../src/Sitemap').then(module => {
            Sitemap = module;
            jest.resetModules();
        })
    })

    it("should not be started twice", () => {
        expect(Sitemap.Start).not.toThrow(Error);
        expect(Sitemap.Start).toThrow(Error);
    });

    it("should not be ended twice", () => {
        expect(Sitemap.Start).not.toThrow(Error);
        expect(Sitemap.End).not.toThrow(Error);
        expect(Sitemap.End).toThrow(Error);
    });

    it("should not be started after ending", () => {
        Sitemap.Start();
        Sitemap.End();
        expect(Sitemap.Start).toThrow(Error);
    });

    it("should not end before start is called", () => {
        expect(Sitemap.End).toThrow(Error);
        Sitemap.Start();
        expect(Sitemap.End).not.toThrow(Error);
    });

    it("should not output XML if imcomplete", () => {
        expect(Sitemap.GetXML).toThrow();
        Sitemap.Start();
        expect(Sitemap.GetXML).toThrow();
        Sitemap.End();
        expect(Sitemap.GetXML).not.toThrow();
    });

    it("should not allow adding empty urls", () => {
        Sitemap.Start();
        expect(()=>Sitemap.AddURL("")).toThrow();
    });

    it("outputs correct basic sitemap if no urls are added", () => {
        Sitemap.Start();
        Sitemap.End();
        expect(Sitemap.GetXML).not.toThrow();
        expect(Sitemap.GetXML()).toMatchSnapshot();
    });

    it("outputs correct sitemap when adding urls", () => {
        Sitemap.Start();
        Sitemap.AddURL("https://thundersmotch.com/test/");
        Sitemap.End();
        expect(Sitemap.GetXML()).toMatchSnapshot();
    });

});