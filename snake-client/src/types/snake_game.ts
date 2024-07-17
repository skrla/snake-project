/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/snake_game.json`.
 */
export type SnakeGame = {
    address: '13RUPAPTgSEHnvnVtPGXtD3wG8EXoLUkAuERLD96bSeB';
    metadata: {
        name: 'snakeGame';
        version: '0.1.0';
        spec: '0.1.0';
        description: 'Created with Anchor';
    };
    instructions: [
        {
            name: 'initializeMonthlyGame';
            discriminator: [82, 94, 72, 26, 110, 37, 32, 186];
            accounts: [
                {
                    name: 'game';
                    writable: true;
                    signer: true;
                },
                {
                    name: 'admin';
                    writable: true;
                    signer: true;
                },
                {
                    name: 'systemProgram';
                    address: '11111111111111111111111111111111';
                }
            ];
            args: [
                {
                    name: 'gamePrice';
                    type: 'u64';
                }
            ];
        },
        {
            name: 'newHighScore';
            discriminator: [46, 82, 121, 229, 210, 170, 12, 11];
            accounts: [
                {
                    name: 'game';
                    writable: true;
                },
                {
                    name: 'winner';
                    writable: true;
                },
                {
                    name: 'gameScore';
                    writable: true;
                }
            ];
            args: [];
        },
        {
            name: 'submitScore';
            discriminator: [212, 128, 45, 22, 112, 82, 85, 235];
            accounts: [
                {
                    name: 'game';
                    writable: true;
                },
                {
                    name: 'gameScore';
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: 'account';
                                path: 'game.count';
                                account: 'game';
                            },
                            {
                                kind: 'account';
                                path: 'game';
                            }
                        ];
                    };
                },
                {
                    name: 'player';
                    writable: true;
                    signer: true;
                },
                {
                    name: 'systemProgram';
                    address: '11111111111111111111111111111111';
                }
            ];
            args: [];
        },
        {
            name: 'updateScore';
            discriminator: [188, 226, 238, 41, 14, 241, 105, 215];
            accounts: [
                {
                    name: 'game';
                    writable: true;
                },
                {
                    name: 'gameScore';
                    writable: true;
                },
                {
                    name: 'player';
                    writable: true;
                    signer: true;
                }
            ];
            args: [
                {
                    name: 'score';
                    type: 'u16';
                }
            ];
        }
    ];
    accounts: [
        {
            name: 'game';
            discriminator: [27, 90, 166, 125, 74, 100, 121, 18];
        },
        {
            name: 'gameScore';
            discriminator: [100, 200, 234, 23, 69, 12, 125, 141];
        }
    ];
    errors: [
        {
            code: 6000;
            name: 'unauthorized';
            msg: 'Unauthorized attempt to update score.';
        },
        {
            code: 6001;
            name: 'invalidRecipient';
            msg: 'Invalid recipient for payout.';
        }
    ];
    types: [
        {
            name: 'game';
            type: {
                kind: 'struct';
                fields: [
                    {
                        name: 'authority';
                        type: 'pubkey';
                    },
                    {
                        name: 'winner';
                        type: 'pubkey';
                    },
                    {
                        name: 'winnerHighScore';
                        type: 'u16';
                    },
                    {
                        name: 'count';
                        type: 'u64';
                    },
                    {
                        name: 'gamePrice';
                        type: 'u64';
                    }
                ];
            };
        },
        {
            name: 'gameScore';
            type: {
                kind: 'struct';
                fields: [
                    {
                        name: 'submitter';
                        type: 'pubkey';
                    },
                    {
                        name: 'index';
                        type: 'u64';
                    },
                    {
                        name: 'score';
                        type: 'u16';
                    }
                ];
            };
        }
    ];
};
