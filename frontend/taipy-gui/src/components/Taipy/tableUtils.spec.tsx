import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

import { EditableCell, generateHeaderClassName, RowValue } from "./tableUtils";

describe("generateHeaderClassName", () => {
    it("should generate a CSS class name with a hyphen prefix and convert to lowercase", () => {
        const result = generateHeaderClassName("ColumnName");
        expect(result).toBe("-columnname");
    });

    it("should replace spaces and special characters with hyphens", () => {
        const result = generateHeaderClassName("Column Name@123!");
        expect(result).toBe("-column-name-123-");
    });

    it("should remove multiple hyphens in a row", () => {
        const result = generateHeaderClassName("Column--Name");
        expect(result).toBe("-column-name");
    });

    it("should handle empty strings and return an empty string", () => {
        const result = generateHeaderClassName("");
        expect(result).toBe("");
    });

    it("should return empty string for the undefined", () => {
        const result = generateHeaderClassName(undefined);
        expect(result).toBe("");
    });
});

describe("Editable cell", () => {
    const formatConfig = {
        timeZone: "FR",
        forceTZ: false,
        date: "dd/MM/yyyy",
        dateTime: "dd/MM/yyyy hh:mm",
        number: "",
    };
    const colDesc = { dfid: "id", type: "bool", index: 0 };
    describe("Non editable mode", () => {
        it("show a boolean as a switch", () => {
            const { getByRole } = render(
                <EditableCell
                    rowIndex={0}
                    value={true}
                    formatConfig={formatConfig}
                    colDesc={colDesc}
                    tableClassName="taipy-table"
                />
            );
            const elt = getByRole("checkbox");
            expect(elt.tagName).toBe("INPUT");
            const switchCtl = elt.closest(".MuiSwitch-root");
            expect(switchCtl).not.toBeNull();
            expect(switchCtl).toHaveClass("taipy-table-bool");
        });
        it("show a boolean as a check", () => {
            const { getByRole } = render(
                <EditableCell
                    rowIndex={0}
                    value={true}
                    formatConfig={formatConfig}
                    colDesc={colDesc}
                    useCheckbox={true}
                    tableClassName="taipy-table"
                />
            );
            const elt = getByRole("checkbox");
            expect(elt.tagName).toBe("INPUT");
            expect(elt.closest(".MuiSwitch-root")).toBeNull();
            expect(elt).toHaveClass("taipy-table-bool");
        });
    });
    describe("Editable mode", () => {
        const onValidation = (value: RowValue, rowIndex: number, colName: string, userValue: string, tz?: string) => {};
        it("show a boolean as a switch", async () => {
            const { getByRole, getByTestId } = render(
                <EditableCell
                    rowIndex={0}
                    value={true}
                    formatConfig={formatConfig}
                    colDesc={colDesc}
                    tableClassName="taipy-table"
                    onValidation={onValidation}
                />
            );
            const but = getByTestId("EditIcon");
            await userEvent.click(but);
            const elt = getByRole("checkbox");
            expect(elt.tagName).toBe("INPUT");
            const switchCtl = elt.closest(".MuiSwitch-root");
            expect(switchCtl).not.toBeNull();
            expect(switchCtl).toHaveClass("taipy-table-bool");
        });
        it("show a boolean as a check", async () => {
            const { getByRole, getByTestId } = render(
                <EditableCell
                    rowIndex={0}
                    value={true}
                    formatConfig={formatConfig}
                    colDesc={colDesc}
                    useCheckbox={true}
                    tableClassName="taipy-table"
                    onValidation={onValidation}
                />
            );
            const but = getByTestId("EditIcon");
            await userEvent.click(but);
            const elt = getByRole("checkbox");
            expect(elt.tagName).toBe("INPUT");
            expect(elt.closest(".MuiSwitch-root")).toBeNull();
            expect(elt).toHaveClass("taipy-table-bool");
        });
    });
});
