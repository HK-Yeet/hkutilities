import { Client, Collection, Message, MessageEmbed } from "discord.js";
import HKandler from "../../structures/hkandler";

module.exports = {
  name: "help",
  aliases: ["commands"],
  category: "utilities",
  hidden: true,
  clientPerms: ["EMBED_LINKS", "SEND_MESSAGES", "ADD_REACTIONS"],
  description: "Shows all of the commands",
  callback: async ({
    message,
    args,
    hkandler,
    bot,
  }: {
    message: Message;
    args: string[];
    hkandler: HKandler;
    bot: Client;
  }) => {
    if (!args.length) {
      const categories: any = new Collection();
      const helpDescription = `Welcome to the help menu. Here, you will find all the commands that I have. Use the reactions to get your way around the menu. If you need help on one specific command, type ${hkandler.prefix}help <command>`;
      hkandler.commands.forEach((command: any) => {
        if (command.hidden && !message.member!.hasPermission("ADMINISTRATOR"))
          return;
        if (command.ownerOnly && !hkandler.owners.includes(message.author.id))
          return;
        if (command.userPerms) {
          let { userPerms } = command;
          if (typeof userPerms === "string") {
            userPerms = [userPerms];
          }

          for (const permission of userPerms) {
            if (!message.member!.hasPermission(permission)) {
              return;
            }
          }
        }
        const category: Collection<string, string> = categories.get(
          `${command.category ? command.category.toLowerCase() : "Uncategorized"}`
        );
        if (category) {
          category.set(command.name, command);
        } else {
          categories.set(
            `${command.category ? command.category.toLowerCase() : "Uncategorized"}`,
            new Collection().set(command.name, command)
          );
        }
      });
      let pageTitle: any = Array.from(
        categories.map((category: any, name: any) => name)
      );
      let pages: any = Array.from(
        categories.map((category: any[], name: any) =>
          category.map((command) => `\`${command.name}\``)
        )
      );
      let page = 0;
      let embed = {
        color: message.guild!.me!.displayHexColor,
        author: { icon_url: bot.user!.displayAvatarURL(), name: "Commands" },
        description: `${
          hkandler.helpDescription
            ? hkandler.helpDescription.replace("{PREFIX}", `${hkandler.prefix}`)
            : `${helpDescription}`
        }`,
      };
      let msg = await message.channel.send({ embed: embed });

      msg.react("◀️");
      msg.react("⏹");
      msg.react("▶️");

      const reactionCollector = msg.createReactionCollector(
        (_reaction: any, user: { id: any }) => user.id == message.author.id,
        {
          time: 180000,
        }
      );

      reactionCollector.on(
        "collect",
        (
          reaction: {
            emoji: { name: any };
            users: { remove: (arg0: any) => Promise<any> };
          },
          user: any
        ) => {
          let direction = reaction.emoji.name;
          reaction.users.remove(user).catch((err) => {});
          switch (direction) {
            case "◀️":
              if (page > 1) {
                page--;
                let edit = {
                  author: {
                    icon_url: bot.user!.displayAvatarURL(),
                    name:
                      pageTitle[page - 1].charAt(0).toUpperCase() +
                      pageTitle[page - 1].slice(1),
                  },
                  description: `${pages[page - 1].sort().join(", ")}`,
                  footer: {
                    text: `Page ${page} of ${pages.length}`,
                  },
                  color: message.guild!.me!.displayHexColor,
                };

                msg.edit({ embed: edit });
              }
              break;
            case "▶️":
              if (page < pages.length) {
                page++;
                let edit = {
                  author: {
                    icon_url: bot.user!.displayAvatarURL(),
                    name:
                      pageTitle[page - 1].charAt(0).toUpperCase() +
                      pageTitle[page - 1].slice(1),
                  },
                  description: `${pages[page - 1].sort().join(", ")}`,
                  footer: {
                    text: `Page ${page} of ${pages.length}`,
                  },
                  color: message.guild!.me!.displayHexColor,
                };

                msg.edit({ embed: edit });
              }
              break;
            case "⏹":
              reactionCollector.stop();
              msg.delete();
              message.delete().catch((o_O: any) => {});
              break;
          }
        }
      );
    } else {
      let commandName = args.join();
      const command =
        hkandler.commands.get(commandName) ||
        hkandler.commands.find(
          (cmd: any) => cmd.aliases && cmd.aliases.includes(commandName)
        );
      if (!command)
        return message.channel.send(`Not a valid command ${message.author}`);

      let embed = {
        color: message.guild!.me!.displayHexColor,
        author: { icon_url: bot.user!.displayAvatarURL(), name: command.name },
        fields: [
          {
            name: "Aliases",
            value: command.aliases.join(", ") || "None",
          },
          {
            name: "Category",
            value: command.category || "Uncategorized",
          },
          {
            name: "Cooldown",
            value: `${command.cooldown || hkandler.defaultCooldown} seconds`,
          },
          {
            name: "Description",
            value: `${command.description || "No description given"}`,
          },
        ],
      };
      message.channel.send({ embed: embed });
    }
  },
};
