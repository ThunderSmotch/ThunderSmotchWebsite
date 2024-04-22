import { GetPageTree } from '../src/PageTree';

import { GetSubDirs } from '../src/FileUtils';

jest.mock('../src/FileUtils');

describe("GetPageTree", () => {
    it("returns a one level PageTree if there are no subdirectories", () => {
        jest.mocked(GetSubDirs).mockReturnValue([]);

        expect(GetPageTree().pages).toStrictEqual({});
    });

    it("returns a two level deep PageTree correctly", () => {
        jest.mocked(GetSubDirs).mockReturnValueOnce(["A", "B", "C"]).mockReturnValue([]);

        let pageTree = GetPageTree();

        expect(Object.keys(pageTree.pages)).toHaveLength(3);
        expect(Object.values(pageTree.pages)[0].pages).toStrictEqual({});
    });

    it("returns a three level deep PageTree correctly", () => {
        jest.mocked(GetSubDirs).mockReturnValueOnce(["A"]).mockReturnValueOnce(["B"]).mockReturnValue([]);

        let pageTree = GetPageTree();

        expect(Object.keys(pageTree.pages)).toStrictEqual(["A"]);
        expect(Object.keys(pageTree.pages["A"].pages)).toStrictEqual(["B"]);
        expect(pageTree.pages["A"].pages["B"].pages).toStrictEqual({});
    });
});