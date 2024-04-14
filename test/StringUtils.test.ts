import {ToLowerCaseWithoutSpaces} from "../src/StringUtils";

test("Lowercase stays lowercase", () => {
    expect(ToLowerCaseWithoutSpaces("abc")).toBe("abc");
})