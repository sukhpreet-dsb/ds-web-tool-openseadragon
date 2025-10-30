import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { useToolStore } from "../store/toolStore";
import { useMapContext } from "../contexts/MapContext";
import { TOOLS } from "../tools/toolConfig";
import { Camera } from "lucide-react";
import { captureMapAndDrawingScreenshot, downloadScreenshot } from "../utils/screenshot-utils";

const Toolbar = () => {
  const [open, setOpen] = useState(true);
  const { selectedTool, activateTool } = useToolStore();
  const ctx = useMapContext();

  const handleToolClick = (toolId: string) => {
    activateTool(ctx, toolId as "select" | "line" | "arrow" | "text" | "hand" | "");
  };

const handleScreenshot = async () => {
  if (!ctx.viewer || !ctx.fabricCanvas) {
    console.error("Viewer or canvas not available for screenshot");
    return;
  }
  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const filename = `map-screenshot-${timestamp}.png`;
    const blob = await captureMapAndDrawingScreenshot(ctx.viewer, ctx.fabricCanvas, {
      format: "png",
      quality: 1,
      backgroundColor: "#ffffff"
    });
    downloadScreenshot(blob, filename);
  } catch (error) {
    console.error("Error taking screenshot:", error);
  }
};

  return (
    <div className="absolute left-2 top-2 flex gap-2">
      {/* Tools Dropdown */}
      <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="cursor-pointer">
            <Menu />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="mt-3"
          align="start"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDown={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DropdownMenuLabel className="px-3">Tools</DropdownMenuLabel>
          <DropdownMenuGroup className="my-2 px-3">
            <div className="grid grid-cols-2 gap-4">
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <DropdownMenuItem
                    key={tool.id}
                    onSelect={(e) => e.preventDefault()}
                    className={`w-full cursor-pointer ${
                      selectedTool === tool.id
                        ? "bg-[#e0dfff] focus:bg-[#e0dfff]"
                        : "focus:bg-zinc-200/60"
                    } hover:bg-[#e0dfff]  delay-75 transition-all flex justify-center `}
                    onClick={() => handleToolClick(tool.id)}
                    title={tool.name}
                  >
                    <Icon />
                  </DropdownMenuItem>
                );
              })}
            </div>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
       {/* Screenshot Button */}
      <Button
        variant="outline"
        className="cursor-pointer"
        onClick={handleScreenshot}
        // onClick={capture}
        title="Take Screenshot"
      >
        <Camera />
      </Button>
    </div>
  );
};

export default Toolbar;
