import { Client, Collection } from "discord.js";
import { join } from "path";
import loadStuff from "../functions/handlers";

type Directories = {
  commandsDir?: string;
  eventsDir?: string;
  featuresDir?: string;
};

class HKandler {
  private _commandsDir: string = "commands";
  private _eventsDir: string = "events";
  private _featuresDir: string = "features";
  private _prefix: string = "!";
  private _mentionPreix: boolean = false;
  private _defaultCooldown: number = 3;
  private _owners: string[] = [""];
  private _commands: Collection<any, any> = new Collection();
  private _helpDescription: string | null = null;
  constructor(bot: Client, directories?: Directories) {
    if (!bot) {
      throw new Error(
        "HKUtilities ❯ No Discord.JS Client provided ❯ Need further assistance? Join the discord https://hk-yeet.github.io/discord"
      );
    }
    if (directories) {
      if (directories.commandsDir) {
        this._commandsDir = directories.commandsDir;
      } else {
        console.warn(
          'HKUtilities ❯ No commands directory provided ❯ Using "commands"'
        );
      }
      if (directories.eventsDir) {
        this._eventsDir = directories.eventsDir;
      } else {
        console.warn(
          'HKUtilities ❯ No events directory provided ❯ Using "cevents"'
        );
      }
      if (directories.featuresDir) {
        this._featuresDir = directories.featuresDir;
      } else {
        console.warn(
          'HKUtilities ❯ No features directory provided ❯ Using "features"'
        );
      }
    } else {
      console.warn("HKUtilities ❯ No directories given ❯ Using defaults");
    }

    if (module && require.main) {
      const { path } = require.main;
      if (path) {
        loadStuff(
          bot,
          join(path, this._commandsDir),
          join(path, this._eventsDir),
          join(path, this._featuresDir),
          this
        );
      }
    }
  }
  public get commands() {
    return this._commands;
  }
  public setOwners(owners: string[]) {
    this._owners = owners;
    return this;
  }
  public get owners() {
    return this._owners;
  }
  public setPrefix(prefix: string) {
    this._prefix = prefix;
    return this;
  }
  public get prefix() {
    return this._prefix;
  }
  public setMentionPrefix(mentionPrefix: boolean) {
    this._mentionPreix = mentionPrefix;
    return this;
  }
  public get mentionPrefix() {
    return this._mentionPreix;
  }
  public setDefaultCooldown(cooldown: number) {
    this._defaultCooldown = cooldown;
    return this;
  }
  public get defaultCooldown() {
    return this._defaultCooldown;
  }
  public setHelpDescription(helpDescription: string) {
    this._helpDescription = helpDescription;
    return this;
  }
  public get helpDescription() {
    return this._helpDescription;
  }
}
export = HKandler;
