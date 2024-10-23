// services/TideService.ts

interface TideData {
  time: string;
  height: number;
}

interface TideCycle {
  startTime: string;
  endTime: string;
  lowestPoint: TideData;
  highestPoint: TideData;
}

interface DailyExtremes {
  cycles: TideCycle[];
}

export class TideSequenceService {
  private tideData: TideData[] = [];
  private readonly THRESHOLD = 6.50;

  public parseData(records: Record<string, string>[]): boolean {
    try {
      this.tideData = records.map((record) => ({
        time: record.time,
        height: parseFloat(record.height),
      }));
      return true;
    } catch (error) {
      console.error('Error parsing tide data:', error);
      return false;
    }
  }

  private findCycles(): TideCycle[] {
    const cycles: TideCycle[] = [];
    let currentCycle: {
      startTime?: string;
      points: TideData[];
    } | null = null;

    for (let i = 0; i < this.tideData.length; i++) {
      const current = this.tideData[i];
      const prev = i > 0 ? this.tideData[i - 1] : null;

      if (prev && prev.height >= this.THRESHOLD && current.height < this.THRESHOLD) {
        if (currentCycle) {
          const cycle = this.createCycle(currentCycle);
          if (cycle) cycles.push(cycle);
        }

        currentCycle = {
          startTime: current.time,
          points: [current],
        };
      } else if (currentCycle) {
        currentCycle.points.push(current);

        if (prev && prev.height < this.THRESHOLD && current.height >= this.THRESHOLD) {
          const cycle = this.createCycle(currentCycle);
          if (cycle) cycles.push(cycle);
          currentCycle = null;
        }
      }
    }

    if (currentCycle) {
      const cycle = this.createCycle(currentCycle);
      if (cycle) cycles.push(cycle);
    }

    return cycles;
  }

  private createCycle(cycleData: { startTime?: string; points: TideData[] }): TideCycle | null {
    if (!cycleData.startTime || cycleData.points.length === 0) return null;

    const lowestPoint = cycleData.points.reduce(
      (min, point) => point.height < min.height ? point : min,
      cycleData.points[0],
    );

    const highestPoint = cycleData.points.reduce(
      (max, point) => point.height > max.height ? point : max,
      cycleData.points[0],
    );

    return {
      startTime: cycleData.startTime,
      endTime: cycleData.points[cycleData.points.length - 1].time,
      lowestPoint,
      highestPoint,
    };
  }

  public getDailyExtremes(): DailyExtremes {
    const cycles = this.findCycles();
    return { cycles };
  }

  public processTideData(records: Record<string, string>[]): DailyExtremes | null {
    if (this.parseData(records)) {
      return this.getDailyExtremes();
    }
    return null;
  }
}
