(module
  (import "runtime" "print_x" (func $print_x))

  (memory 1)

  (func $add (param $lhs i32) (param $rhs i32) (result i32)
    local.get $lhs
    local.get $rhs
    i32.add)
  (export "add" (func $add))

  ;; Fibonacci, recursive
  (func $fibo (param $n i64) (result i64)
    (if (result i64)
      (i64.eq (local.get $n) (i64.const 0))
      (then (i64.const 0))
      (else
        (if (result i64)
          (i64.eq (local.get $n) (i64.const 1))
          (then (i64.const 1))
          (else
            (i64.add
              (call $fibo
                (i64.sub
                  (local.get $n)
                  (i64.const 1)))
              (call $fibo
                (i64.sub
                  (local.get $n)
                  (i64.const 2)))) (drop) (memory.size) (i64.extend_i32_s))
        )
      )
    )
  )
  (export "fibo" (func $fibo))
  (func $print_fibo (param $n i64)
    (memory.grow (i32.const 40))
    (drop)
    (call $print_x))
    (export "print_fibo" (func $print_fibo))
)
