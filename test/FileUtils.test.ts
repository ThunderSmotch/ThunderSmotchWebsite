import {WriteStringToFile, GetFileData, MakeDirectory, CatDirs, MoveFolderFromTo, GetAllFilesRecursively, GetFilesInsideDirWithExtension, GetMainFileInsideDir} from '../src/FileUtils';

import fs from 'fs';
jest.mock('fs');

// Types to choose correct overloads
type ReadDirSync = (
    path: fs.PathLike,
    options ?: null
) => string[];

type CopyFile = (
    from: fs.PathLike,
    to: fs.PathLike,
    callback: fs.NoParamCallback
) => void;

describe("WriteStringToFile", () => {
    it("should call the write fs function", () => {
        WriteStringToFile("", "");
        expect(fs.writeFileSync).toHaveBeenCalled();
    });
});

describe("GetFileData", () => {
    it("should return the file data if file exists", () => {
        jest.mocked(fs.existsSync).mockReturnValue(true);
        jest.mocked(fs.readFileSync).mockReturnValue("test");
        expect(GetFileData("")).toBe("test");
    });

    it("should throw if file does not exist", () => {
        jest.mocked(fs.existsSync).mockReturnValue(false);
        expect(() => {GetFileData("")}).toThrow();
    });
});

describe("MakeDirectory", () => {
    it("should just return if dir already exists", () => {
        jest.mocked(fs.existsSync).mockReturnValue(true);
        MakeDirectory("test");
        expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it("call fs.mkdir if dir does not exist", () => {
        jest.mocked(fs.existsSync).mockReturnValue(false);
        MakeDirectory("test");
        expect(fs.mkdirSync).toHaveBeenCalled();
    });
});

describe("CatDirs", () => {
    it("should throw if both dirs are empty", () => {
        expect(() => {CatDirs("", "");}).toThrow();
    });

    it("should return the non empty dir if the other is empty", () => {
        expect(CatDirs("", "abc")).toBe("abc");
        expect(CatDirs("cde", "")).toBe("cde");
    });

    it("should append dir1 to dir2 with a slash if both are non-empty", () => {
        expect(CatDirs("abc", "def")).toBe("abc/def");
        expect(CatDirs("./a/b", "c/d/g.cpp")).toBe("./a/b/c/d/g.cpp");
    });
});

describe("GetAllFilesRecursively", () => {
    it("throws if directory does not exist", () => {
        jest.mocked(fs.existsSync).mockReturnValue(false);
        expect(() => GetAllFilesRecursively("dir")).toThrow();
    });

    it("creates as many files as the ones inside the dir", () => {
        jest.mocked(fs.existsSync).mockReturnValue(true); 
        jest.mocked(fs.readdirSync as ReadDirSync).mockReturnValue(["a.cpp", "x.js", "abc.css"]);
        jest.mocked(fs.statSync).mockReturnValue(undefined);
        expect(GetAllFilesRecursively("dir").length).toBe(3);
    });

    it("should not count directories", () => {
        jest.mocked(fs.existsSync).mockReturnValue(true);
        jest.mocked(fs.readdirSync as ReadDirSync).mockReturnValue(["a.cpp", "x.js", "abc.css"]).mockReturnValueOnce(["X", "a.exe"]);

        let stat = new fs.Stats();
        let spy = jest.spyOn(stat, "isDirectory");
        spy.mockReturnValue(false).mockReturnValueOnce(true);

        jest.mocked(fs.statSync).mockReturnValue(stat);
        expect(GetAllFilesRecursively("dir").length).toBe(4);
        expect(spy).toHaveBeenCalledTimes(5);
    });
});

describe("MoveFolderTo", () => {
    it("should throw if input folder does not exist", () => {
        jest.mocked(fs.existsSync).mockReturnValue(false);
        expect(() => MoveFolderFromTo("", "")).toThrow();
    });

    
    it("should create as many files as the input folder contains", () => {
        jest.mocked(fs.existsSync).mockReturnValue(true);
        jest.mocked(fs.readdirSync as ReadDirSync).mockReturnValue(["a.cpp"]);
        MoveFolderFromTo("aASDAD", "basd");
        expect(fs.copyFile).toHaveBeenCalledTimes(1);
    });

    it("should throw async in case of errors", () => {
        jest.mocked(fs.copyFile as CopyFile).mockImplementation((src, dest, callback) => {callback( Error("TestError") )});
        expect(() => MoveFolderFromTo("A", "A")).toThrow();
    });
});

describe("GetFilesInsideDirWithExtension", () => {
    it("should return nothing if no extensions given", () => {
        let dirent = new fs.Dirent();
        dirent.name = "abc.x";
        jest.spyOn(dirent, "isDirectory").mockReturnValue(false);

        jest.mocked(fs.readdirSync).mockReturnValue([dirent]);

        expect(GetFilesInsideDirWithExtension("", [])).toStrictEqual([]);
    });

    it("should return list with files with given extensions", () => {
        // Fake dir with 3 files
        let dirent1 = new fs.Dirent();
        jest.spyOn(dirent1, "isDirectory").mockReturnValue(false);
        dirent1.name = "abc.md";

        let dirent2 = new fs.Dirent();
        jest.spyOn(dirent2, "isDirectory").mockReturnValue(false);
        dirent2.name = "abc.tex";

        let dirent3 = new fs.Dirent();
        jest.spyOn(dirent3, "isDirectory").mockReturnValue(false);
        dirent3.name = "abc.html";
        
        jest.mocked(fs.readdirSync).mockReturnValue([dirent1, dirent2, dirent3]);

        expect(GetFilesInsideDirWithExtension("dir", [".tex", ".md"]).sort()).toStrictEqual(["abc.tex", "abc.md"].sort());
    });
});

describe("GetMainFileInsideDir", () => {
    it("should throw if no main file inside dir", () => {
        let dirent = new fs.Dirent();
        dirent.name = "abc.testext";
        jest.spyOn(dirent, "isDirectory").mockReturnValue(false);
        jest.mocked(fs.readdirSync).mockReturnValue([dirent]);

        expect(() => GetMainFileInsideDir("dir")).toThrow();
    });

    it("should return main file if it exists", () => {
        let dirent = new fs.Dirent();
        dirent.name = "abc.html";
        jest.spyOn(dirent, "isDirectory").mockReturnValue(false);
        jest.mocked(fs.readdirSync).mockReturnValue([dirent]);

        expect(GetMainFileInsideDir("dir")).toBe(dirent.name);
    });

    it("should return first main file if two of them exist", () => {
        let dirent1 = new fs.Dirent();
        dirent1.name = "a.html";
        jest.spyOn(dirent1, "isDirectory").mockReturnValue(false);

        let dirent2 = new fs.Dirent();
        dirent2.name = "b.webtex";
        jest.spyOn(dirent2, "isDirectory").mockReturnValue(false);

        jest.mocked(fs.readdirSync).mockReturnValue([dirent1, dirent2]);

        expect(GetMainFileInsideDir("dir")).toBe(dirent1.name);
    });
});