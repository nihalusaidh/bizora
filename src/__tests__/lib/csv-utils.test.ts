import { parseCSV, toCSV } from "@/lib/csv-utils";

describe("CSV Utils", () => {
  describe("parseCSV", () => {
    it("parses simple CSV", () => {
      const csv = "name,price\nProduct A,100\nProduct B,200";
      const result = parseCSV(csv);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ name: "Product A", price: "100" });
      expect(result[1]).toEqual({ name: "Product B", price: "200" });
    });

    it("handles quoted fields", () => {
      const csv = 'name,description\n"A","Has, comma"';
      const result = parseCSV(csv);
      expect(result[0].description).toBe("Has, comma");
    });

    it("returns empty array for header-only CSV", () => {
      expect(parseCSV("name,price")).toHaveLength(0);
    });

    it("returns empty array for empty string", () => {
      expect(parseCSV("")).toHaveLength(0);
    });

    it("handles missing fields gracefully", () => {
      const csv = "name,price\nProduct A";
      const result = parseCSV(csv);
      expect(result[0].name).toBe("Product A");
      expect(result[0].price).toBe("");
    });
  });

  describe("toCSV", () => {
    it("converts data to CSV", () => {
      const data = [{ name: "A", price: 100 }, { name: "B", price: 200 }];
      const csv = toCSV(data, ["name", "price"]);
      const lines = csv.split("\n");
      expect(lines[0]).toBe("name,price");
      expect(lines[1]).toBe("A,100");
      expect(lines[2]).toBe("B,200");
    });

    it("returns header-only for empty data", () => {
      expect(toCSV([], ["name", "price"])).toBe("name,price\n");
    });

    it("handles values with commas", () => {
      const data = [{ name: "A, B", price: 100 }];
      const csv = toCSV(data, ["name", "price"]);
      expect(csv.split("\n")[1]).toBe('"A, B",100');
    });

    it("handles values with quotes", () => {
      const data = [{ name: 'Say "hello"', price: 100 }];
      const csv = toCSV(data, ["name", "price"]);
      expect(csv.split("\n")[1]).toBe('"Say ""hello""",100');
    });

    it("handles null/undefined values", () => {
      const data = [{ name: "A", price: null }];
      const csv = toCSV(data, ["name", "price"]);
      expect(csv.split("\n")[1]).toBe("A,");
    });
  });
});
