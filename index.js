require('dotenv').config();
const http = require('http');
const { 
    Client, 
    GatewayIntentBits, 
    REST, 
    Routes, 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    EmbedBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');

// -------------------------------------------------------------
// 1. HTTP Server for Render Hosting Keep-Alive
// -------------------------------------------------------------
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('South Wales RP Bot is operational.');
    res.end();
}).listen(PORT, () => {
    console.log(`Render HTTP listener running on port ${PORT}`);
});

// -------------------------------------------------------------
// 2. Discord Bot Initialization
// -------------------------------------------------------------
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages
    ] 
});

const commands = [
    new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Post the South Wales RP application panel in this channel')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('Registered /panel command successfully.');
    } catch (err) {
        console.error('Failed to register commands:', err);
    }
});

// Store active applications in memory (Applicant ID mapped to review message ID)
const activeApplications = new Map();

client.on('interactionCreate', async (interaction) => {

    // -------------------------------------------------------------
    // /panel Command Execution
    // -------------------------------------------------------------
    if (interaction.isChatInputCommand() && interaction.commandName === 'panel') {
        const embed = new EmbedBuilder()
            .setTitle('🏴󠁧󠁢󠁷󠁬󠁳󠁿 South Wales Roleplay — Recruitment Portal')
            .setDescription('Select the application form you wish to fill out from the drop-down menu below.\n\n**Requirements:**\n• Must be **13 years of age or older**.\n• Must maintain active involvement across server roleplay activities.')
            .setColor('#00ffcc')
            .setFooter({ text: 'South Wales RP • Recruitment Panel' })
            .setTimestamp();

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('app_select_menu')
            .setPlaceholder('Choose a department or role...')
            .addOptions([
                {
                    label: 'Moderator Application',
                    description: 'Staff moderation team (Age 13+ & Active)',
                    value: 'app_mod',
                    emoji: '🛡️'
                },
                {
                    label: 'Administrator Application',
                    description: 'Senior management team (Age 13+ & Active)',
                    value: 'app_admin',
                    emoji: '👑'
                },
                {
                    label: 'Emergency Services (SWP / NHS)',
                    description: 'South Wales Police or NHS First Responder',
                    value: 'app_services',
                    emoji: '🚓'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({ content: 'Application panel deployed!', ephemeral: true });
        await interaction.channel.send({ embeds: [embed], components: [row] });
    }

    // -------------------------------------------------------------
    // Dropdown Selection -> Application Modals
    // -------------------------------------------------------------
    else if (interaction.isStringSelectMenu() && interaction.customId === 'app_select_menu') {
        const selected = interaction.values[0];

        if (selected === 'app_mod') {
            const modal = new ModalBuilder()
                .setCustomId('modal_app_mod')
                .setTitle('Moderator Application');

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('age').setLabel('Age (Must be 13 or older)').setStyle(TextInputStyle.Short).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('activity').setLabel('Will you remain active in the server? (Yes/No)').setStyle(TextInputStyle.Short).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('experience').setLabel('Previous Staff Experience').setStyle(TextInputStyle.Paragraph).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('situation').setLabel('How do you handle severe FailRP/arguments?').setStyle(TextInputStyle.Paragraph).setRequired(true)
                )
            );

            await interaction.showModal(modal);
        } 
        
        else if (selected === 'app_admin') {
            const modal = new ModalBuilder()
                .setCustomId('modal_app_admin')
                .setTitle('Administrator Application');

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('age').setLabel('Age (Must be 13 or older)').setStyle(TextInputStyle.Short).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('activity').setLabel('Will you maintain active involvement? (Yes/No)').setStyle(TextInputStyle.Short).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('leadership').setLabel('Why do you qualify for Admin?').setStyle(TextInputStyle.Paragraph).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('resolution').setLabel('How do you manage internal staff issues?').setStyle(TextInputStyle.Paragraph).setRequired(true)
                )
            );

            await interaction.showModal(modal);
        }

        else if (selected === 'app_services') {
            const modal = new ModalBuilder()
                .setCustomId('modal_app_services')
                .setTitle('Emergency Services Application');

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('age').setLabel('Age (Must be 13 or older)').setStyle(TextInputStyle.Short).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('dept').setLabel('Department (SWP / NHS / HWFRS)').setStyle(TextInputStyle.Short).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('activity').setLabel('Will you remain active on duty? (Yes/No)').setStyle(TextInputStyle.Short).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('rp_exp').setLabel('Previous Emergency RP Experience').setStyle(TextInputStyle.Paragraph).setRequired(true)
                )
            );

            await interaction.showModal(modal);
        }
    }

    // -------------------------------------------------------------
    // Application Modal Submission -> DM Owner
    // -------------------------------------------------------------
    else if (interaction.isModalSubmit()) {
        const ageInput = parseInt(interaction.fields.getTextInputValue('age'));

        // Requirement Check: Age 13+
        if (isNaN(ageInput) || ageInput < 13) {
            return interaction.reply({ 
                content: '❌ **Application Rejected:** You must be 13 years of age or older to submit an application for South Wales RP.', 
                ephemeral: true 
            });
        }

        let appType = '';
        const fields = [
            { name: 'Applicant', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
            { name: 'User ID', value: interaction.user.id, inline: true },
            { name: 'Age', value: `${ageInput}`, inline: true }
        ];

        if (interaction.customId === 'modal_app_mod') {
            appType = '🛡️ Moderator Application';
            fields.push(
                { name: 'Active Agreement', value: interaction.fields.getTextInputValue('activity') },
                { name: 'Previous Experience', value: interaction.fields.getTextInputValue('experience') },
                { name: 'Conflict Resolution', value: interaction.fields.getTextInputValue('situation') }
            );
        } else if (interaction.customId === 'modal_app_admin') {
            appType = '👑 Administrator Application';
            fields.push(
                { name: 'Active Agreement', value: interaction.fields.getTextInputValue('activity') },
                { name: 'Leadership Qualifications', value: interaction.fields.getTextInputValue('leadership') },
                { name: 'Staff Issue Resolution', value: interaction.fields.getTextInputValue('resolution') }
            );
        } else if (interaction.customId === 'modal_app_services') {
            appType = '🚓 Emergency Services Application';
            fields.push(
                { name: 'Department', value: interaction.fields.getTextInputValue('dept') },
                { name: 'Active Agreement', value: interaction.fields.getTextInputValue('activity') },
                { name: 'RP Experience', value: interaction.fields.getTextInputValue('rp_exp') }
            );
        }

        const appEmbed = new EmbedBuilder()
            .setTitle(`Review Required: ${appType}`)
            .setColor('#0099ff')
            .addFields(fields)
            .setFooter({ text: 'South Wales RP • Owner Review System' })
            .setTimestamp();

        const reviewButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`accept_${interaction.user.id}`)
                .setLabel('Accept Application')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`decline_${interaction.user.id}`)
                .setLabel('Decline Application')
                .setStyle(ButtonStyle.Danger)
        );

        try {
            const owner = await client.users.fetch(process.env.OWNER_ID);
            await owner.send({ embeds: [appEmbed], components: [reviewButtons] });
            await interaction.reply({ 
                content: '✅ Your application has been submitted directly to management! You will receive a direct message once a decision is made.', 
                ephemeral: true 
            });
        } catch (err) {
            console.error('DM Dispatch Error:', err);
            await interaction.reply({ 
                content: '⚠️ Failed to send your application to the server owner via DM. Please check if the owner has DMs enabled.', 
                ephemeral: true 
            });
        }
    }

    // -------------------------------------------------------------
    // Owner Decision Buttons (Accept / Decline)
    // -------------------------------------------------------------
    else if (interaction.isButton()) {
        const [action, applicantId] = interaction.customId.split('_');

        if (action === 'accept' || action === 'decline') {
            try {
                const applicant = await client.users.fetch(applicantId);
                const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0]);

                if (action === 'accept') {
                    originalEmbed.setColor('#00ff00').setTitle(`${originalEmbed.data.title} — [ACCEPTED]`);
                    
                    // User Acceptance DM
                    await applicant.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('🎉 Application Accepted — South Wales Roleplay')
                                .setDescription(`Congratulations! Your recent application for **South Wales RP** has been **ACCEPTED**.\n\nPlease contact server management in the Discord server to complete your onboarding process.`)
                                .setColor('#00ff00')
                                .setTimestamp()
                        ]
                    });

                    await interaction.update({ embeds: [originalEmbed], components: [] });
                    await interaction.followUp({ content: `✅ Application accepted. Notice delivered to <@${applicantId}>.`, ephemeral: true });

                } else if (action === 'decline') {
                    originalEmbed.setColor('#ff0000').setTitle(`${originalEmbed.data.title} — [DECLINED]`);

                    // User Rejection DM
                    await applicant.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('Application Update — South Wales Roleplay')
                                .setDescription(`Hello,\n\nThank you for applying to **South Wales RP**. Unfortunately, your application has not been accepted at this time.\n\nYou are welcome to re-apply in the future when recruitment re-opens.`)
                                .setColor('#ff0000')
                                .setTimestamp()
                        ]
                    });

                    await interaction.update({ embeds: [originalEmbed], components: [] });
                    await interaction.followUp({ content: `❌ Application declined. Notice delivered to <@${applicantId}>.`, ephemeral: true });
                }

            } catch (err) {
                console.error('Error handling decision:', err);
                await interaction.reply({ content: '⚠️ Unable to message the applicant directly (User may have DMs closed). Status updated locally.', ephemeral: true });
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
