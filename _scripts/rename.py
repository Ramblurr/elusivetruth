import yaml, sys, re
from unicodedata import normalize

_punct_re = re.compile(r'[\t !"#$%&\'()*\-/<=>?@\[\\\]^_`{|},.]+')

# from http://flask.pocoo.org/snippets/5/
def slugify(text, delim=u'-'):
    """Generates an slightly worse ASCII-only slug."""
    result = []
    for word in _punct_re.split(text.lower()):
        word = normalize('NFKD', word).encode('ascii', 'ignore')
        if word:
            result.append(word)
    return unicode(delim.join(result))

file = sys.argv[1]

docs = yaml.load_all(open(file, "r").read())

d = docs.next()

slug = slugify(unicode(d['title']))
print re.sub("-\d+.html", "-"+slug+".html", file)
