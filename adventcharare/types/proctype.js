module.exports = ProcType;

function ProcType(proctype) {
    this.type = proctype.type;
	this.level = proctype.level;
	this.durability = proctype.durability;
	this.quality = proctype.quality;
}