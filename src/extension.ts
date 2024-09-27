import * as vscode from "vscode";
import fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  const globalWorkspace = new GlobalWorkspace();

  console.log("Active");
  vscode.commands.registerCommand("global-workspace.init", () => {
    globalWorkspace.init();
  });
}

export function deactivate() {
  console.log("deac");
}

class GlobalWorkspace {
  public init() {
    if (this.initialized) return console.error("Tried to init twice...");

    this.setPath();
    if (!this.path) return;

    this.handleConfigFile();
    this.get("http://localhost:3000/newRepo", { jaja: "jee" });
  }

  private handleConfigFile() {
    const json = this.readConfigFile();
    if (!json) return console.error("Failed to read config file");
    console.log(json);
  }

  private readConfigFile(): ConfigObj | null {
    const configFilePath = `${this.path}/${this.configFileName}`;
    if (!fs.existsSync(configFilePath)) return null;

    const data = fs.readFileSync(configFilePath);
    const string = data.toString();
    const json = JSON.parse(string);
    if (!this.checkConfigFile(json)) return null;
    return json;
  }

  private checkConfigFile(object: any) {
    if (typeof object !== "object") return false;
    if (typeof object.name !== "string") return false;
    if (typeof object.id !== "string") return false;
    if (typeof object.version !== "number") return false;
    return true;
  }

  private get(url: string, params: UrlParams = {}) {
    return new Promise(async (reject, resolve) => {
      const keys = Object.keys(params);
      if (keys.length > 0) {
        url += "?";
        keys.forEach((key) => {
          url += `${key}=${params[key]}`;
        });
      }
      console.log(url);
      const data = await (await fetch(url)).json();
      console.log(data);
      return data;

      /*http
        .get(url, (res) => {
          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            resolve(data);
          });
        })
        .on("error", (err) => {
          console.log(err);
        });*/
    });
  }

  private setPath() {
    if (
      !vscode.workspace.workspaceFolders ||
      vscode.workspace.workspaceFolders.length !== 1
    ) {
      vscode.window.showInformationMessage("Please open a workspace");
      return;
    }

    this.path = vscode.workspace.workspaceFolders[0].uri.fsPath;
  }

  private initialized = false;
  private connected = false;
  private path: string | null = null;
  private configFileName = ".globalconf";
}

interface ConfigObj {
  name: string;
  id: string;
  version: number;
}

interface UrlParams {
  [param: string]: string;
}
