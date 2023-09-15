"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Timetable = require("comcigan-parser");
const config_1 = __importDefault(require("config"));
class default_1 extends Timetable {
    constructor(cache) {
        super();
        this._classDuration = [45, 50];
        this._initialized = false;
        this._schoolName = config_1.default.get('school.name');
        this._mobileClass = new Set(config_1.default.get('mobileClass'));
        this._cacheDuration = cache || 0;
    }
    getClassTimetable(grade, classNumber, weekDay) {
        const _super = Object.create(null, {
            getTimetable: { get: () => super.getTimetable }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._initialized)
                yield this._reset();
            const timetable = yield _super.getTimetable.call(this);
            const weekDaySet = new Set(weekDay);
            const timetableByWeekday = [];
            timetable[grade][classNumber].forEach((data, index) => {
                if (!weekDaySet.has(index))
                    return;
                timetableByWeekday.push(data.map((item) => {
                    return {
                        classTime: item.classTime,
                        teacher: item.teacher,
                        subject: item.subject,
                    };
                }));
            });
            return timetableByWeekday;
        });
    }
    getPeriods(periods) {
        const _super = Object.create(null, {
            getClassTime: { get: () => super.getClassTime }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._initialized)
                yield this._reset();
            const period = (yield _super.getClassTime.call(this))[periods - 1];
            const [hours, minutes] = period.split(/(\(|\))/)[2].split(':');
            const duration = this._schoolName.search('고등학교') === -1 ? this._classDuration[0] : this._classDuration[1];
            const startTime = new Date();
            startTime.setHours(Number(hours));
            startTime.setMinutes(Number(minutes));
            startTime.setSeconds(0);
            startTime.setMilliseconds(0);
            const endTime = Date.parse(startTime.toString()) + duration * 60 * 1000;
            return {
                start: startTime.getTime(),
                end: endTime,
                duration,
            };
        });
    }
    getMobileClass(grade, classNumber, weekDay) {
        return __awaiter(this, void 0, void 0, function* () {
            const [timetable] = yield this.getClassTimetable(grade, classNumber, [weekDay]);
            if (timetable === undefined)
                return [];
            return timetable.filter((item) => {
                if (this.isMobileClass(item.subject))
                    return true;
            });
        });
    }
    isMobileClass(subject) {
        return this._mobileClass.has(subject);
    }
    _reset() {
        return __awaiter(this, void 0, void 0, function* () {
            const option = {
                maxGrade: config_1.default.get('school.highestGrade') || 3,
                cache: this._cacheDuration,
            };
            yield this.init(option);
            this.setSchool(config_1.default.get('school.code'));
            this._initialized = true;
        });
    }
}
exports.default = default_1;
