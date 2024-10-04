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

    this.initialized = true;
    this.connect("ccebaead-3480-4fc8-9f70-9c8274e0a09b", "pass", -1);
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

  private get(url: string, params: UrlParams = {}): Promise<any> {
    return new Promise(async (reject, resolve) => {
      const keys = Object.keys(params);
      if (keys.length > 0) {
        url += "?";
        keys.forEach((key, idx) => {
          if (idx != 0) url += "&";
          url += `${key}=${params[key]}`;
        });
      }
      console.log("Fetching url:", url);
      const data = await fetch(url);
      const json = await data.json();
      console.log("Received:", json);
      return json;
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

  private async newRepo(
    name: string,
    password: string,
    options?: NewRepoOptions
  ) {
    const url = `${this.baseUrl}/newRepo`;
    const json = await this.get(url, { name, password });
    const id = json.id;
    console.log(id);
  }

  private connect(id: string, password: string, version: number) {}

  private initialized = false;
  private connected = false;
  private path: string | null = null;
  private configFileName = ".globalconf";
  private baseUrl = "http://localhost:3000";
}

interface ConfigObj {
  name: string;
  id: string;
  version: number;
}

interface UrlParams {
  [param: string]: string;
}

interface NewRepoOptions {
  autoconnect?: boolean;
}
