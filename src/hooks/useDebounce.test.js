import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDebounce } from "./useDebounce";
describe("useDebounce", ()=>{
    it("delays value updates", async ()=>{
        const { result, rerender } = renderHook(({ v })=>useDebounce(v, 50), {
            initialProps: {
                v: "a"
            }
        });
        expect(result.current).toBe("a");
        rerender({
            v: "b"
        });
        expect(result.current).toBe("a");
        await waitFor(()=>expect(result.current).toBe("b"));
    });
});
