require('dotenv').config();
const http = require('http');
const { 
    Client, 
    GatewayIntentBits, 
    REST, 
    Routes, 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    EmbedBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');

// 1. Keep-Alive Server for Render Hosting
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('South Wales RP Staff Bot Operational.');
    res.end();
}).listen(PORT, () => {
    console.log(`Render HTTP listener running on port ${PORT}`);
});

// 2. Initialize Discord Client
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages
    ] 
});

const commands = [
    new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Post individual staff application panels')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('SUCCESS: /panel registered to guild.');
    } catch (err) {
        console.error('Command registration error:', err);
    }
});

client.on('interactionCreate', async (interaction) => {

    // -------------------------------------------------------------
    // Execute /panel Command — Sends Separate Square Panels
    // -------------------------------------------------------------
    if (interaction.isChatInputCommand() && interaction.commandName === 'panel') {
        await interaction.deferReply({ ephemeral: true });

        // Compact Embed 1: Trial Moderator
        const tmodEmbed = new EmbedBuilder()
            .setTitle('🔰 Trial Moderator')
            .setDescription('**Requirements:** Age 13+ • Active\nEntry-level moderation role.')
            .setColor('#00ffff');
        const tmodBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_app_tmod').setLabel('Apply for Trial Mod').setStyle(ButtonStyle.Primary)
        );

        // Compact Embed 2: Moderator
        const modEmbed = new EmbedBuilder()
            .setTitle('🛡️ Moderator')
            .setDescription('**Requirements:** Age 13+ • Active\nFull moderation duties.')
            .setColor('#00ff88');
        const modBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_app_mod').setLabel('Apply for Moderator').setStyle(ButtonStyle.Success)
        );

        // Compact Embed 3: Administrator
        const adminEmbed = new EmbedBuilder()
            .setTitle('👑 Administrator')
            .setDescription('**Requirements:** Age 13+ • Active\nSenior server oversight.')
            .setColor('#ffbb00');
        const adminBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_app_admin').setLabel('Apply for Admin').setStyle(ButtonStyle.Secondary)
        );

        // Compact Embed 4: Senior Administrator
        const srAdminEmbed = new EmbedBuilder()
            .setTitle('⚡ Senior Administrator')
            .setDescription('**Requirements:** Age 13+ • Active\nHigh-level server leadership.')
            .setColor('#ff5500');
        const srAdminBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_app_sradmin').setLabel('Apply for Sr. Admin').setStyle(ButtonStyle.Danger)
        );

        // Compact Embed 5: Head of Staff
        const headStaffEmbed = new EmbedBuilder()
            .setTitle('🌟 Head of Staff')
            .setDescription('**Requirements:** Age 13+ • Active\nStaff team management.')
            .setColor('#aa00ff');
        const headStaffBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_app_headstaff').setLabel('Apply for Head of Staff').setStyle(ButtonStyle.Primary)
        );

        await interaction.channel.send({ embeds: [tmodEmbed], components: [tmodBtn] });
        await interaction.channel.send({ embeds: [modEmbed], components: [modBtn] });
        await interaction.channel.send({ embeds: [adminEmbed], components: [adminBtn] });
        await interaction.channel.send({ embeds: [srAdminEmbed], components: [srAdminBtn] });
        await interaction.channel.send({ embeds: [headStaffEmbed], components: [headStaffBtn] });

        await interaction.editReply({ content: 'All application panels deployed successfully!' });
    }

    // -------------------------------------------------------------
    // Direct Button Clicks -> Instant Synchronous Modal Pop-up
    // -------------------------------------------------------------
    else if (interaction.isButton() && interaction.customId.startsWith('btn_app_')) {
        const role = interaction.customId.replace('btn_app_', '');

        const ageCheckInput = new TextInputBuilder()
            .setCustomId('q1_age_check')
            .setLabel('1. Confirm Age: Type YES if you are 13 or older')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('YES')
            .setRequired(true);

        let modalTitle = '';
        const modal = new ModalBuilder();

        if (role === 'tmod') {
            modalTitle = 'Trial Moderator Application';
            modal.setCustomId('modal_app_tmod').setTitle(modalTitle).addComponents(
                new ActionRowBuilder().addComponents(ageCheckInput),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q2').setLabel('2. Will you remain active daily?').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q3').setLabel('3. Why do you want to join our staff team?').setStyle(TextInputStyle.Paragraph).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q4').setLabel('4. How do you handle severe FailRP?').setStyle(TextInputStyle.Paragraph).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q5').setLabel('5. Any previous staff/mod experience?').setStyle(TextInputStyle.Paragraph).setRequired(true))
            );
        } else if (role === 'mod') {
            modalTitle = 'Moderator Application';
            modal.setCustomId('modal_app_mod').setTitle(modalTitle).addComponents(
                new ActionRowBuilder().addComponents(ageCheckInput),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q2').setLabel('2. Weekly activity commitment (Hours/week)').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q3').setLabel('3. How do you de-escalate a heated staff sit?').setStyle(TextInputStyle.Paragraph).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q4').setLabel('4. How do you stay unbiased with friends?').setStyle(TextInputStyle.Paragraph).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q5').setLabel('5. Detailed staff history and skills').setStyle(TextInputStyle.Paragraph).setRequired(true))
            );
        } else if (role === 'admin') {
            modalTitle = 'Administrator Application';
            modal.setCustomId('modal_app_admin').setTitle(modalTitle).addComponents(
                new ActionRowBuilder().addComponents(ageCheckInput),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q2').setLabel('2. Can you dedicate 10+ hours weekly?').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q3').setLabel('3. What makes you qualified for Admin over Mod?').setStyle(TextInputStyle.Paragraph).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q4').setLabel('4. How do you deal with abusive staff?').setStyle(TextInputStyle.Paragraph).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q5').setLabel('5. How would you plan or assist RP events?').setStyle(TextInputStyle.Paragraph).setRequired(true))
            );
        } else if (role === 'sradmin') {
            modalTitle = 'Senior Administrator Application';
            modal.setCustomId('modal_app_sradmin').setTitle(modalTitle).addComponents(
                new ActionRowBuilder().addComponents(ageCheckInput),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q2').setLabel('2. Confirm high daily activity (Yes/No)').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q3').setLabel('3. Previous leadership/management experience?').setStyle(TextInputStyle.Paragraph).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q4').setLabel('4. How do you handle major server crises?').setStyle(TextInputStyle.Paragraph).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q5').setLabel('5. What improvements would you make?').setStyle(TextInputStyle.Paragraph).setRequired(true))
            );
        } else if (role === 'headstaff') {
            modalTitle = 'Head of Staff Application';
            modal.setCustomId('modal_app_headstaff').setTitle(modalTitle).addComponents(
                new ActionRowBuilder().addComponents(ageCheckInput),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q2').setLabel('2. Confirm high daily activity (Yes/No)').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q3').setLabel('3. How will you recruit & train staff?').setStyle(TextInputStyle.Paragraph).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q4').setLabel('4. How will you evaluate staff activity?').setStyle(TextInputStyle.Paragraph).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q5').setLabel('5. What is your vision for the staff team?').setStyle(TextInputStyle.Paragraph).setRequired(true))
            );
        }

        // Must be called synchronously within milliseconds
        return interaction.showModal(modal).catch(err => console.error('Error opening modal:', err));
    }

    // -------------------------------------------------------------
    // Modal Submissions -> Fast Ephemeral Response + Async DM
    // -------------------------------------------------------------
    else if (interaction.isModalSubmit()) {
        const ageCheck = interaction.fields.getTextInputValue('q1_age_check').trim().toLowerCase();

        if (ageCheck !== 'yes' && ageCheck !== 'y') {
            return interaction.reply({ 
                content: '❌ **Application Denied:** You must confirm that you are 13 years of age or older (by typing YES) to apply for staff at South Wales RP.',
                ephemeral: true 
            });
        }

        // Instant response to user to prevent interaction timeout
        await interaction.reply({ 
            content: '✅ Your staff application has been submitted to management! You will receive a DM notification once reviewed.', 
            ephemeral: true 
        });

        let staffRole = '';
        const fields = [
            { name: 'Applicant', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
            { name: 'User ID', value: interaction.user.id, inline: true },
            { name: '13+ Confirmed', value: '✅ YES', inline: true },
            { name: 'Answer 2', value: interaction.fields.getTextInputValue('q2') },
            { name: 'Answer 3', value: interaction.fields.getTextInputValue('q3') },
            { name: 'Answer 4', value: interaction.fields.getTextInputValue('q4') },
            { name: 'Answer 5', value: interaction.fields.getTextInputValue('q5') }
        ];

        if (interaction.customId === 'modal_app_tmod') staffRole = '🔰 Trial Moderator Application';
        else if (interaction.customId === 'modal_app_mod') staffRole = '🛡️ Moderator Application';
        else if (interaction.customId === 'modal_app_admin') staffRole = '👑 Administrator Application';
        else if (interaction.customId === 'modal_app_sradmin') staffRole = '⚡ Senior Administrator Application';
        else if (interaction.customId === 'modal_app_headstaff') staffRole = '🌟 Head of Staff Application';

        const appEmbed = new EmbedBuilder()
            .setTitle(`Review Required: ${staffRole}`)
            .setColor('#0099ff')
            .addFields(fields)
            .setFooter({ text: 'South Wales RP • Staff Management Review' })
            .setTimestamp();

        const reviewButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`accept_${interaction.user.id}`).setLabel('Accept').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`decline_${interaction.user.id}`).setLabel('Decline').setStyle(ButtonStyle.Danger)
        );

        // Perform owner fetch in background after acknowledging user
        try {
            const owner = await client.users.fetch(process.env.OWNER_ID);
            await owner.send({ embeds: [appEmbed], components: [reviewButtons] });
        } catch (err) {
            console.error('Failed to DM owner:', err);
        }
    }

    // -------------------------------------------------------------
    // Accept / Decline Management Action Buttons
    // -------------------------------------------------------------
    else if (interaction.isButton() && (interaction.customId.startsWith('accept_') || interaction.customId.startsWith('decline_'))) {
        await interaction.deferReply({ ephemeral: true });

        const [action, applicantId] = interaction.customId.split('_');

        try {
            const applicant = await client.users.fetch(applicantId);
            const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0]);

            if (action === 'accept') {
                originalEmbed.setColor('#00ff00').setTitle(`${originalEmbed.data.title} — [ACCEPTED]`);
                await applicant.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('🎉 Staff Application Accepted — South Wales Roleplay')
                            .setDescription('Congratulations! Your staff application for **South Wales RP** has been **ACCEPTED**.\n\nPlease contact server management in Discord to receive your roles and onboarding.')
                            .setColor('#00ff00')
                            .setTimestamp()
                    ]
                });
                await interaction.message.edit({ embeds: [originalEmbed], components: [] });
                await interaction.editReply({ content: `✅ Application accepted. DM sent to <@${applicantId}>.` });
            } else if (action === 'decline') {
                originalEmbed.setColor('#ff0000').setTitle(`${originalEmbed.data.title} — [DECLINED]`);
                await applicant.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Staff Application Update — South Wales Roleplay')
                            .setDescription('Hello,\n\nThank you for applying to **South Wales RP**. Unfortunately, your staff application was not accepted at this time.\n\nYou are welcome to re-apply in the future.')
                            .setColor('#ff0000')
                            .setTimestamp()
                    ]
                });
                await interaction.message.edit({ embeds: [originalEmbed], components: [] });
                await interaction.editReply({ content: `❌ Application declined. DM sent to <@${applicantId}>.` });
            }
        } catch (err) {
            console.error('Error handling decision:', err);
            await interaction.editReply({ content: '⚠️ Decision updated, but unable to DM applicant (User DMs may be closed).' });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
