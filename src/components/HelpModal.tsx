import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TOOLS } from "@/tools/toolConfig";
import { CircleQuestionMark, Camera } from "lucide-react";

const shortcuts = [
  { title: "Copy", value: "ctrl c", symbol: "+" },
  { title: "Paste", value: "ctrl v", symbol: "+" },
  { title: "Undo", value: "ctrl z", symbol: "+" },
  { title: "Redo", value: "ctrl y", symbol: "+" },
  { title: "Select", value: "hold space" },
  { title: "Move", value: "hold ctrl" },
  { title: "Delete", value: "backspace delete", symbol: "or" },
  { title: "Screenshot", value: "click camera icon", custom: true },
];

export function HelpModal() {
  return (
    <div className="absolute right-2 bottom-2">
      <Dialog>
        <form>
          <DialogTrigger asChild>
            <Button variant="outline" className="cursor-pointer">
              <CircleQuestionMark />
            </Button>
          </DialogTrigger>
          <DialogContent className="md:max-w-2xl lg:max-w-[900px] h-[91%] md:h-[550px] overflow-auto ">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Keyboard shortcuts
              </DialogTitle>
              <hr className="border-t border-zinc-200 mt-4" />
            </DialogHeader>
            <div className="w-full">
              {/* <h2 className="text-xl font-semibold mb-5">Keyboard shortcuts</h2> */}
              <div className="w-full flex flex-col md:flex-row gap-10">
                <div id="tools" className="w-full md:w-1/2">
                  <h3 className="text-lg font-medium mb-3">Tools</h3>
                  <ul className="border border-zinc-300 rounded-md divide-y divide-zinc-200">
                    {TOOLS.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <li
                          key={tool.id}
                          className="py-2 px-4 flex justify-between items-center text-zinc-800"
                        >
                          {tool.name}
                          <span>
                            <Icon />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div id="shotcuts" className="w-full md:w-1/2 ">
                  <h3 className="text-lg font-medium mb-3">Shortcuts</h3>
                  <ul className="border border-zinc-300 rounded-md divide-y divide-zinc-200">
                    {shortcuts.map((shortcut) => (
                      <li
                        key={shortcut.title}
                        className="py-2 px-4 flex justify-between items-center"
                      >
                        <span className="text-zinc-800">{shortcut.title}</span>{" "}
                        <span className="flex gap-2 text-zinc-600">
                          {shortcut.custom ? (
                            <span className="flex items-center gap-2">
                              <Camera size={16} />
                              <span className="text-sm">{shortcut.value}</span>
                            </span>
                          ) : (
                            <>
                              <span className="bg-[#e0dfff] px-2 py-0.5 rounded-sm">
                                {shortcut.value.split(" ")[0]}
                              </span>
                              {shortcut.symbol && <span>{shortcut.symbol}</span>}
                              {shortcut.value.split(" ")[1] && (
                                <span className="bg-[#e0dfff] px-2 py-0.5 rounded-sm">
                                  {shortcut.value.split(" ")[1]}
                                </span>
                              )}
                            </>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </DialogContent>
        </form>
      </Dialog>
    </div>
  );
}
