import mongoengine as me

class Chart(me.Document):
    address = me.StringField(required=True)
    config = me.DictField(default={}, null=False)
    story = me.StringField(default='')
    chartType = me.StringField(required=True)
    filteredData = me.DictField(required=True)
    filterQuery = me.StringField(required=True)
    query = me.StringField(required=True)
    uuid = me.StringField(required=True, unique=True)