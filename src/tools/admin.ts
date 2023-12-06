import addEmbed from "@embeds/admin/add";
import removeEmbed from "@embeds/admin/remove";
import resetEmbed from "@embeds/admin/reset";
import wipeEmbed from "@embeds/admin/wipe";
import shopEmbed from "@/builders/embeds/shop";

import pageShopButtons from "@/builders/buttons/pageShop";
import interactShopButtons from "@/builders/buttons/interactShop";

import { CacheType, CommandInteraction } from "discord.js";
import { DB } from "@/index";
import noItems from "@/builders/embeds/errors/shop/noItems";

export const add = async function add(
  interaction: CommandInteraction<CacheType>
) {
  const memberId: string = interaction.options.getUser("member")!.id;
  const amount: number = interaction.options.get("amount")!.value as number;
  const scope = interaction.options.get("scope")?.value as string;
  const guild = DB.getGuild(interaction.guildId!);

  const embed = addEmbed(
    interaction.user.id,
    amount,
    memberId,
    guild.lang,
    scope,
    guild.pointName
  );

  guild.getUser(memberId).addPoints(amount, scope);

  await interaction.reply({ embeds: [embed] });
};

export const remove = async function remove(
  interaction: CommandInteraction<CacheType>
) {
  const memberId: string = interaction.options.getUser("member")!.id;
  const amount: number = interaction.options.get("amount")!.value as number;
  const scope = interaction.options.get("scope")?.value as string;

  const guild = DB.getGuild(interaction.guildId!);

  const embed = removeEmbed(
    interaction.user.id,
    amount,
    memberId,
    scope,
    guild.lang,
    guild.pointName
  );

  guild.getUser(memberId).addPoints(-amount, scope);

  await interaction.reply({ embeds: [embed] });
};

export const reset = async function reset(
  interaction: CommandInteraction<CacheType>
) {
  const memberId = interaction.options.getUser("member")!.id;
  const scope = interaction.options.get("scope")?.value as string;
  const guild = DB.getGuild(interaction.guildId!);

  const embed = resetEmbed(memberId, scope, guild.lang, guild.pointName);

  guild.getUser(memberId).setPoints(0, scope);

  await interaction.reply({ embeds: [embed] });
};

export const wipe = async function wipe(
  interaction: CommandInteraction<CacheType>
) {
  const scope = interaction.options.get("scope")?.value as string;
  const guild = DB.getGuild(interaction.guildId!);

  const embed = wipeEmbed(scope, guild.lang, guild.pointName);

  // Reset all users' points in database, and then update the cache
  guild.resetPoints();

  await interaction.reply({ embeds: [embed] });
};

export const shop = async function shop(
  interaction: CommandInteraction<CacheType>
) {
  const guild = DB.getGuild(interaction.guildId!);

  // Copied list of the guild items
  let items = [...guild.getShopItems()];

  // If there are no items, send an error message
  if (items.length === 0) {
    await interaction.reply({
      embeds: [noItems(guild.lang)],
      ephemeral: true,
    });
    return;
  }

  const embed = shopEmbed(
    1,
    Math.ceil(guild.shop.length / 5),
    items,
    guild.lang,
    guild.pointName
  );

  const pageButtons = pageShopButtons("admin");

  // If there are less than 5 items, disable the "next" button
  if (guild.shop.length <= 5) pageButtons.components[1].setDisabled(true);
  pageButtons.components[0].setDisabled(true);

  await interaction.reply({
    embeds: [embed],
    components: [
      interactShopButtons(1, items, interaction.guild?.roles.cache!, "edit"),
      interactShopButtons(1, items, interaction.guild?.roles.cache!, "delete"),
      pageButtons,
    ],
    ephemeral: true,
  });
};
