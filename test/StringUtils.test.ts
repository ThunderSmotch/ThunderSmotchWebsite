import {ToLowerCaseWithoutSpaces, GetDayMonthYearString, RemoveOrderingPrefix, SplitStringUppercase, GetPageURL} from "../src/StringUtils";

import {config} from "../src/config";

describe("ToLowerCaseWithoutSpaces", () => {
    it("keeps lowercase and hyphens intact", () => {
        expect(ToLowerCaseWithoutSpaces("abc")).toBe("abc");
        expect(ToLowerCaseWithoutSpaces("abc-def")).toBe("abc-def");
    });
    
    it("keeps lowercase intact but hyphenates whitespace", () => {
        expect(ToLowerCaseWithoutSpaces("abc def")).toBe("abc-def");
        expect(ToLowerCaseWithoutSpaces("abc  def")).toBe("abc-def");
        expect(ToLowerCaseWithoutSpaces("abc  def ghi")).toBe("abc-def-ghi");
    });
    
    it("turns uppercase letters to lowercase", () => {
        expect(ToLowerCaseWithoutSpaces("Abc")).toBe("abc");
        expect(ToLowerCaseWithoutSpaces("ABC")).toBe("abc");
        expect(ToLowerCaseWithoutSpaces("aBc")).toBe("abc");
    });
    
    it("turns uppercase letters to lowercase and whitespace is hyphenated", () => {
        expect(ToLowerCaseWithoutSpaces("Abc Def")).toBe("abc-def");
        expect(ToLowerCaseWithoutSpaces("aBc     X")).toBe("abc-x");
        expect(ToLowerCaseWithoutSpaces("A   B   C")).toBe("a-b-c");
    });
});

describe("GetCurrentDayMonthYear", () => {
    it("is always the expected length", () => {
        expect(GetDayMonthYearString().length).toBe(10);
        expect(GetDayMonthYearString(new Date(2024, 0, 1)).length).toBe(10);
        expect(GetDayMonthYearString(new Date(2024, 10, 11)).length).toBe(10);
    });
    it("correctly pads zeros", () => {
        expect(GetDayMonthYearString(new Date(2024, 0, 1))).toBe("01/01/2024");
        expect(GetDayMonthYearString(new Date(2024, 10, 1))).toBe("01/11/2024");
        expect(GetDayMonthYearString(new Date(2024, 1, 26))).toBe("26/02/2024");
    });
});

describe("RemoveOrderingPrefix", () => {
    it("works in these examples", () => {
        expect(RemoveOrderingPrefix("0.Maths")).toBe("Maths");
        expect(RemoveOrderingPrefix("99999.Maths")).toBe("Maths");
        expect(RemoveOrderingPrefix("0.2D")).toBe("2D");
        expect(RemoveOrderingPrefix("Maths")).toBe("Maths");
        expect(RemoveOrderingPrefix(".test")).toBe(".test");
        expect(RemoveOrderingPrefix("Post2.Subpost")).toBe("Post2.Subpost");
        expect(RemoveOrderingPrefix("01.A/02.B/C")).toBe("A/B/C");
    });
});

describe("SplitStringUppercase", () => {
    it("works in these example", () => {
        expect(SplitStringUppercase("ABC")).toBe("ABC");
        expect(SplitStringUppercase("A")).toBe("A");
        expect(SplitStringUppercase("Test")).toBe("Test");
        expect(SplitStringUppercase("Test2")).toBe("Test2");
        expect(SplitStringUppercase("Nand2Tetris")).toBe("Nand2 Tetris");
        expect(SplitStringUppercase("AaBbCc")).toBe("Aa Bb Cc");
    });
});

describe("GetPageURL", () => {
    it("works in these examples", () => {
        expect(GetPageURL("")).toBe(config.dev.url + '/');
        expect(GetPageURL("abc/def")).toBe(config.dev.url + '/abc/def/');
        expect(GetPageURL("01.Maths")).toBe(config.dev.url + '/Maths/');
    });
});