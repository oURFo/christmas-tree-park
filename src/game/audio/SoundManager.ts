type Tone = { freq: number; dur: number; type?: OscillatorType; gain?: number }

export class SoundManager {
  private ctx: AudioContext | null = null
  muted = false

  private ensure(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext()
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }

  toggleMute(): boolean {
    this.muted = !this.muted
    return this.muted
  }

  private beep(tones: Tone[]) {
    if (this.muted) return
    const ctx = this.ensure()
    const now = ctx.currentTime
    for (const t of tones) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = t.type ?? 'sine'
      osc.frequency.value = t.freq
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(t.gain ?? 0.08, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t.dur)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + t.dur + 0.02)
    }
  }

  ui() {
    this.beep([{ freq: 660, dur: 0.08 }])
  }

  place() {
    this.beep([
      { freq: 880, dur: 0.07 },
      { freq: 1180, dur: 0.09, gain: 0.06 },
    ])
  }

  stringNode() {
    this.beep([{ freq: 740, dur: 0.06, type: 'triangle' }])
  }

  powerOn() {
    this.beep([
      { freq: 392, dur: 0.18, type: 'triangle', gain: 0.07 },
      { freq: 523, dur: 0.22, type: 'triangle', gain: 0.07 },
      { freq: 659, dur: 0.28, type: 'triangle', gain: 0.08 },
    ])
  }

  result() {
    this.beep([
      { freq: 523, dur: 0.12 },
      { freq: 659, dur: 0.12 },
      { freq: 784, dur: 0.18 },
      { freq: 1046, dur: 0.28, gain: 0.06 },
    ])
  }

  undo() {
    this.beep([{ freq: 320, dur: 0.08, type: 'square', gain: 0.03 }])
  }
}
