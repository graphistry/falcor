// The formal specification of the path-syntax interface provided in falcor.

// Top level node in the specification.
`<path-syntax> ::= (` [<identifier>](identifier/identifier.md) | [<indexer>](indexer/indexer.md) )
    ( .[<identifier>](identifier/identifier.md) | [<indexer>](indexer/indexer.md) )*

