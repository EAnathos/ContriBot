import {
  SlashCommandBuilder,
  CommandInteraction,
  SlashCommandSubcommandBuilder,
  SlashCommandStringOption,
  SlashCommandNumberOption,
} from "discord.js";
import { SlashCommand } from "@/types";

import { DB } from "..";
import {
  configShowEmbed,
  configLangEmbed,
  configPointNameEmbed,
  configActionPointEmbed
} from "@/embeds/config";
import { CommandInteractionOptionResolver } from "discord.js";

export const command: SlashCommand = {
  name: "config",
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Configure the bot.")
    .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
      subcommand
        .setName("lang")
        .setDescription("Change the bot language.")
        .addStringOption((option: SlashCommandStringOption) =>
          option
            .setName("language")
            .setDescription("What language would you like to change to ?")
            .addChoices(
              { name: "English", value: "en" },
              { name: "Français", value: "fr" }
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
      subcommand
        .setName("pointname")
        .setDescription("Change the point name.")
        .addStringOption((option: SlashCommandStringOption) =>
          option
            .setName("pointname")
            .setDescription("What would you like to change the point name to ?")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
      subcommand
        .setName("actionpoint")
        .setDescription("Change the base point for each action.")
        .addStringOption((option: SlashCommandStringOption) =>
          option
            .setName("action")
            .setDescription(
              "For which action would you like to change the base points ?"
            )
            .addChoices(
              { name: "Message", value: "message" },
              { name: "Voice", value: "voice" },
              { name: "Bump", value: "bump" },
              { name: "Nitro boost", value: "boost" }
            )
            .setRequired(true)
        )
        .addNumberOption((option: SlashCommandNumberOption) =>
          option
            .setName("points")
            .setDescription("How many points would you like to set ?")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
      subcommand
        .setName("show")
        .setDescription("Show the current configuration.")
    ),
  async execute(interaction: CommandInteraction) {
    const subcommand = (
      interaction.options as CommandInteractionOptionResolver
    ).getSubcommand();

    switch (subcommand) {
      case "lang":
        await lang(interaction);
        break;
      case "pointname":
        await pointName(interaction);
        break;
      case "actionpoint":
        await actionPoint(interaction);
        break;
      default:
        await show(interaction);
        break;
    }
  },
};

async function lang(
  interaction: CommandInteraction<import("discord.js").CacheType>
) {
  const lang = interaction.options.get("language")?.value as string;

  const embed = configLangEmbed(lang);

  DB.getGuild(interaction.guildId!).setLang(lang);

  await interaction.reply({ embeds: [embed] });
}

async function pointName(
  interaction: CommandInteraction<import("discord.js").CacheType>
) {
  const pointName = interaction.options.get("pointname")?.value as string;

  const embed = configPointNameEmbed(pointName);

  DB.getGuild(interaction.guildId!).setPointName(pointName);

  await interaction.reply({ embeds: [embed] });
}

async function actionPoint(
  interaction: CommandInteraction<import("discord.js").CacheType>
) {
  const action = interaction.options.get("action")?.value as string;
  const point = interaction.options.get("points")?.value as number;

  const embed = configActionPointEmbed(action, point, DB.getGuild(interaction.guildId!).pointName);

  DB.getGuild(interaction.guildId!).setActionPoint(action, point);

  await interaction.reply({ embeds: [embed] });
}

async function show(
  interaction: CommandInteraction<import("discord.js").CacheType>
) {
  const guild = DB.getGuild(interaction.guildId!);

  const embed = configShowEmbed(interaction.guildId!, interaction.guild!.iconURL() as string);

  await interaction.reply({ embeds: [embed] });
}
