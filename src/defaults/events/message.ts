import { Client, Collection, Message, MessageEmbed } from "discord.js";
import HKandler from "../../structures/hkandler";
import {
  HumanizeDurationLanguage,
  HumanizeDuration,
} from "humanize-duration-ts";

const humanizer: HumanizeDuration = new HumanizeDuration(
  new HumanizeDurationLanguage()
);

const cooldowns = new Collection();

export = (bot: Client, hkandler: HKandler, message: Message) => {
  if (!message.guild || message.author.bot || message.channel.type == "dm")
    return;

  let prefix = hkandler.prefix;

  const mentionRegexPrefix = RegExp(`^<@!?${bot.user!.id}>`);
  if (hkandler.mentionPrefix) {
    if (message.content.toLowerCase().match(mentionRegexPrefix))
      prefix = message.content.match(mentionRegexPrefix)![0];
  }

  if (!message.content.startsWith(prefix)) return;
  const args: String[] = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/);
  const commandName = args.shift()!.toLowerCase();
  const command =
    hkandler.commands.get(commandName) ||
    hkandler.commands.find(
      (cmd: any) => cmd.aliases && cmd.aliases.includes(commandName)
    );
  if (!command) return;

  if (command.clientPerms) {
    let { clientPerms } = command;
    let hasPermission = true;
    if (typeof clientPerms === "string") {
      clientPerms = [clientPerms];
    }

    for (const permission of clientPerms) {
      if (!message.channel.permissionsFor(message.guild.me!)!.has(permission)) {
        hasPermission = false;
        return message.channel
          .send(
            `I do not have the proper permissions to run this command. I need \`${command.clientPerms
              .join(", ")
              .toLowerCase()
              .split(/_| /g)
              .map((s: any) => s.charAt(0).toUpperCase() + s.substring(1))
              .join(" ")}\`!`
          )
          .catch((O_o: any) => {});
      }
      if (hasPermission) {
        continue;
      }
    }
  }

  if (command.userPerms) {
    let { userPerms } = command;
    let hasPermission = true;
    if (typeof userPerms === "string") {
      userPerms = [userPerms];
    }

    for (const permission of userPerms) {
      if (!message.member!.hasPermission(permission)) {
        hasPermission = false;
        let embed = new MessageEmbed()
          .setTitle("❌・ Error")
          .setColor("RED")
          .setDescription(
            `You do not have permission to use this command! You need ${command.userPerms
              .join(", ")
              .toLowerCase()
              .split(/_| /g)
              .map((s: any) => s.charAt(0).toUpperCase() + s.substring(1))
              .join(" ")}!`
          );
        return message.channel.send(embed).catch((O_o: any) => {});
      }
      if (hasPermission) {
        continue;
      }
    }
  }

  if (!message.channel.nsfw && command.nsfw) {
    let embed = new MessageEmbed()
      .setTitle("❌・ Error")
      .setColor("RED")
      .setDescription("You can only use this command in NSFW channels.");
    return message.channel.send(embed).catch((O_o: any) => {});
  }

  if (command.minArgs) {
    if (args.length < command.minArgs) {
      let embed = new MessageEmbed()
        .setTitle("❌・ Error")
        .setColor("RED")
        .setDescription(
          `Improper Syntax\nUse \`${
            command.usage
              ? `${prefix}${command.name} ${command.usage}`
              : `${prefix}help ${command.name}`
          }\``
        );
      return message.channel.send(embed).catch((O_o: any) => {});
    }
  }

  if (command.maxArgs) {
    if (args.length > command.maxArgs) {
      let embed = new MessageEmbed()
        .setTitle("❌・ Error")
        .setColor("RED")
        .setDescription(
          `Improper Syntax\nUse \`${
            command.usage
              ? `${prefix}${command.name} ${command.usage}`
              : `${prefix}help ${command.name}`
          }\``
        );
      return message.channel.send(embed).catch((O_o: any) => {});
    }
  }
  if (command.ownerOnly) {
    if (!hkandler.owners.includes(message.author.id)) {
      let embed = new MessageEmbed()
        .setTitle("❌・ Error")
        .setColor("RED")
        .setDescription(`You are not authorized to use this command`);
      return message.channel.send(embed).catch((O_o: any) => {});
    }
  }
  if (!hkandler.owners.includes(message.author.id)) {
    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection());
    }
    const now = Date.now();
    const timestamps: any = cooldowns.get(command.name);
    const cooldownAmount =
      (command.cooldown || hkandler.defaultCooldown) * 1000;

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
        const remaining = humanizer.humanize(expirationTime - now, {
          largest: 1,
        });
        let embed = new MessageEmbed()
          .setTitle("❌・ Error")
          .setColor("RED")
          .setDescription(
            `Slow down there buddy! Please wait \`${remaining}\` before using ${command.name}`
          );
        return message.channel.send(embed).catch((O_o: any) => {});
      }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  }

  let client = bot;
  let paramters: object = { bot, client, message, args, hkandler };

  if (command.execute) {
    try {
      command.execute(paramters);
    } catch (error) {
      let embed = new MessageEmbed()
        .setTitle("❌・ Error")
        .setColor("RED")
        .setDescription(`${error}`);
      message.channel.send(embed).catch((O_o: any) => {});
    }
  } else if (command.callback) {
    try {
      command.callback(paramters);
    } catch (error) {
      let embed = new MessageEmbed()
        .setTitle("❌・ Error")
        .setColor("RED")
        .setDescription(`${error}`);
      message.channel.send(embed).catch((O_o: any) => {});
    }
  } else if (command.run) {
    try {
      command.run(paramters);
    } catch (error) {
      let embed = new MessageEmbed()
        .setTitle("❌・ Error")
        .setColor("RED")
        .setDescription(`${error}`);
      message.channel.send(embed).catch((O_o: any) => {});
    }
  }
};
