import {ToLowerCaseWithoutSpaces, GetDayMonthYearString} from "../src/StringUtils";

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