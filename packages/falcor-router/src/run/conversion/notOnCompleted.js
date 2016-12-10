var onCompleted = 'C';

module.exports = notOnCompleted;

function notOnCompleted(note) {
    return note.kind !== onCompleted;
}

