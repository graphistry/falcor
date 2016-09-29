module.exports = internalKeyDefinitions;

function internalKeyDefinitions() {

    const ƒ_ = String.fromCharCode(30);
    const ƒalcor = ƒ_ + 'ƒalcor';

    return {
        'ƒ_':              ƒ_,
        'ƒ_meta':          ƒalcor + '_metadata',

        'ƒm_path':         'path',
        'ƒm_version':      'version',
        'ƒm_abs_path':     'abs_path',
        'ƒm_deref_to':     'deref_to',
        'ƒm_deref_from':   'deref_from',

        'ƒ_key':           ƒalcor + '_key',
        'ƒ_ref':           ƒalcor + '_ref',
        'ƒ_head':          ƒalcor + '_head',
        'ƒ_next':          ƒalcor + '_next',
        'ƒ_path':          ƒalcor + '_path',
        'ƒ_prev':          ƒalcor + '_prev',
        'ƒ_tail':          ƒalcor + '_tail',
        'ƒ_parent':        ƒalcor + '_parent',
        'ƒ_context':       ƒalcor + '_context',
        'ƒ_version':       ƒalcor + '_version',
        'ƒ_abs_path':      ƒalcor + '_abs_path',
        'ƒ_ref_index':     ƒalcor + '_ref_index',
        'ƒ_refs_length':   ƒalcor + '_refs_length',
        'ƒ_invalidated':   ƒalcor + '_invalidated',
        'ƒ_wrapped_value': ƒalcor + '_wrapped_value',
    };
}
