# Hyper Text Label Language

1. Easier to parse than HTML.
2. Open and close tag should be in same line, except the root element.
3. Perserve Spaces, tabs and line-breaks.
4. To support character-level addressing.


## Syntax
   label name (as separator) _abcdefghijklmnopqrstuvwxyz
   label value      . - A-Z chinese character
   label lineNumber
   label type : 
      number { sequencial, allowGap, unique: globally_or_label  }
      string { pattern }

   pitaka_name*volume_IDaAAAbBBBcCCC

   