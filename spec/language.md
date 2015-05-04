```javascript
// The formal specification of the path-syntax interface provided in falcor.
```
// The top level spec for the path-syntax
###### Top Level
\<path-syntax> ::= ( \<identifier> | \<indexer> ) ( .\<identifier> | \<indexer> )*

###### Indexer
\<indexer> ::= [ \<inner-indexer> ]
\<inner-indexer> ::= \<extended-indentifier> | \<range> | \<routed-token>
\<range> ::= \<index>(..|...)\<index>
\<routed-token> ::= { \<inner-routed-token> }

###### Identifier
\<extended-identifier> ::= \<index> | \<quoted-identifier>
\<quoted-identifier> ::= ' \<single-quote-escape> ' | " \<double-quote-escape> "

###### Literals
\<index> ::= 0-9  
\<escape> ::= \  
\<single-quote-escape> ::= (.*|\')*  
\<double-quote-escape> ::= (.*|\")*  
\<identifier> ::= [a-Z_$]a-Z_$0-9  
\<identifier-all> ::= .*  
\<inner-routed-token> ::= ranges | integers | keys  
