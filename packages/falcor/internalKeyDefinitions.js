module.exports = internalKeyDefinitions;

function internalKeyDefinitions() {

    const _f = String.fromCharCode(30);
    const f_ = _f + 'f_';

    return {
        'ƒ_':              _f,
        'ƒ_meta':          f_ + 'metadata',

        'ƒm_path':         'path',
        'ƒm_keys':         'keys',
        'ƒm_version':      'version',
        'ƒm_abs_path':     'abs_path',
        'ƒm_deref_to':     'deref_to',
        'ƒm_deref_from':   'deref_from',

        'ƒ_key':           f_ + 'key',
        'ƒ_ref':           f_ + 'ref',
        'ƒ_head':          f_ + 'head',
        'ƒ_next':          f_ + 'next',
        'ƒ_path':          f_ + 'path',
        'ƒ_prev':          f_ + 'prev',
        'ƒ_tail':          f_ + 'tail',
        'ƒ_parent':        f_ + 'parent',
        'ƒ_context':       f_ + 'context',
        'ƒ_version':       f_ + 'version',
        'ƒ_abs_path':      f_ + 'abs_path',
        'ƒ_ref_index':     f_ + 'ref_index',
        'ƒ_refs_length':   f_ + 'refs_length',
        'ƒ_invalidated':   f_ + 'invalidated',
        'ƒ_wrapped_value': f_ + 'wrapped_value',
    };
}
