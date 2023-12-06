import { DB } from "@/index";
import { BotEvent } from "@/types";
import { Events, Interaction } from "discord.js";
import notFound from "@/builders/embeds/errors/items/itemNotFound";
import tooLong from "@/builders/embeds/errors/items/itemStringTooLong";
import negativePrice from "@/builders/embeds/errors/items/itemNegativePrice";
import stockError from "@/builders/embeds/errors/items/itemStocksError";
import roleNotFound from "@/builders/embeds/errors/roleNotFound";

const event: BotEvent = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction: Interaction) {
    if (!interaction.isModalSubmit()) return;

    if (!interaction.customId.endsWith("EditModal")) return;

    const guild = DB.getGuild(interaction.guildId!);

    const item = guild.getShopItem(interaction.customId.split("-")[1]);

    if (item === null) {
      await interaction.reply({
        embeds: [notFound(guild.lang)],
        ephemeral: true,
      });
    } else {
      let label: string = "default";
      let price: number = 0;
      let quantity: number = -1;

      switch (item.action) {
        case 0: // role
          if (
            interaction.guild?.roles.cache.has(
              interaction.fields.getTextInputValue("roleEditRole")
            )
          ) {
            interaction.reply({
              embeds: [roleNotFound(guild.lang)],
              ephemeral: true,
            });
            return;
          }

          label = `<@&${interaction.fields.getTextInputValue("roleEditRole")}>`;
          item.description = interaction.fields.getTextInputValue(
            "roleEditDescription"
          );
          price = parseInt(
            interaction.fields.getTextInputValue("roleEditPrice")
          );
          quantity = parseInt(
            interaction.fields.getTextInputValue("roleEditStocks")
          );

          break;
        case 1: // boost
          label = item.label;
          item.description = interaction.fields.getTextInputValue(
            "boostEditDescription"
          );
          price = parseInt(
            interaction.fields.getTextInputValue("boostEditPrice")
          );
          item.multiplier = parseInt(
            interaction.fields.getTextInputValue("boostEditMultiplier")
          );
          item.boost_duration =
            interaction.fields.getTextInputValue("boostEditDuration");
          quantity = parseInt(
            interaction.fields.getTextInputValue("boostEditStocks")
          );

          // TODO Change Label
          const labelInput =
            interaction.fields.getTextInputValue("boostEditLabel");
          const match = labelInput.match(
            /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) x(\d+) (.+)/
          );

          if (match) {
            const [_, date, boost, text] = match;
            item.label = `${date} x${boost} ${text}`;
          } else {
            // Gérer le cas où le format n'est pas correct
            console.error("Error in boostEditModal.ts: label format");
          }

          break;
        case 2: // text
          label = interaction.fields.getTextInputValue("textEditLabel");
          item.description = interaction.fields.getTextInputValue(
            "textEditDescription"
          );
          price = parseInt(
            interaction.fields.getTextInputValue("textEditPrice")
          );
          quantity = 1;

          break;
        case 3: // custom
          label = interaction.fields.getTextInputValue("customEditName");
          item.description = interaction.fields.getTextInputValue(
            "customEditDescription"
          );
          price = parseInt(
            interaction.fields.getTextInputValue("customEditPrice")
          );
          quantity = parseInt(
            interaction.fields.getTextInputValue("customEditStocks")
          );

          break;
        default:
          //TODO add error message
          interaction.reply({ content: "Unknown item type", ephemeral: true });
          break;
      }

      if (label.length > 30) {
        await interaction.reply({
          embeds: [tooLong(guild.lang, "name", label.length, 30)],
          ephemeral: true,
        });
      }

      if (price < 0) {
        await interaction.reply({
          embeds: [negativePrice(guild.lang)],
          ephemeral: true,
        });
      }

      if (quantity < -1) {
        await interaction.reply({
          embeds: [stockError(guild.lang)],
          ephemeral: true,
        });
      }

      item.label = label;
      item.price = price;
      item.max_quantity = quantity;
      item.update();
      interaction.reply({ content: "Item edited", ephemeral: true });
    }
  },
};

export default event;
